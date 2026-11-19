import os
import sys

# Auto-resolve local venv site-packages if launched via system python
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_venv_site = os.path.join(_backend_dir, "venv", "Lib", "site-packages")
if os.path.exists(_venv_site) and _venv_site not in sys.path:
    sys.path.insert(0, _venv_site)

import time
import threading
import urllib.request
from flask import Flask, request, jsonify
from flask_cors import CORS
from parser import extract_resume_data
from ats import calculate_ats, calculate_job_match
from ai import analyze_resume, get_required_skills
from db import (
    init_db,
    get_db,
    User,
    ResumeScan,
    create_jwt_token,
    get_current_user_from_request,
)

START_TIME = time.time()

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

# Initialize Neon DB tables on server start
init_db()


# ==========================================================
# HEALTH & HEARTBEAT KEEP-ALIVE ENDPOINTS
# ==========================================================

@app.route("/")
def home():
    return jsonify({
        "message": "CVPilot Engine API Running",
        "service": "CVPilot",
        "status": "online",
        "timestamp": time.time()
    })


@app.route("/health")
@app.route("/ping")
def health_check():
    return jsonify({
        "status": "online",
        "service": "CVPilot",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "timestamp": time.time()
    }), 200


# ==========================================================
# USER AUTHENTICATION APIS (Neon DB)
# ==========================================================

@app.route("/auth/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    print(f"[CVPilot Auth] Signup attempt for email: '{email}'")

    if not name:
        return jsonify({"error": "Full name is required."}), 400
    if not email:
        return jsonify({"error": "Email address is required."}), 400
    if not password:
        return jsonify({"error": "Password is required."}), 400

    import re
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"error": "Please enter a valid email address (e.g. name@domain.com)."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    db = get_db()
    if not db:
        print("[CVPilot Auth] Signup error: Database unavailable")
        return jsonify({"error": "Neon Database is initializing or unreachable. Please retry in a few seconds."}), 503

    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"[CVPilot Auth] Signup rejected: Email '{email}' already registered.")
            return jsonify({"error": "An account with this email already exists. Please sign in instead."}), 409

        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"[CVPilot Auth] User '{email}' registered successfully with ID {new_user.id}.")

        token = create_jwt_token(new_user.id, new_user.email, new_user.name)

        return jsonify({
            "message": "Account created successfully!",
            "token": token,
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        print(f"[CVPilot Auth] Signup exception: {e}")
        return jsonify({"error": f"Failed to create account: {str(e)}"}), 500
    finally:
        db.close()


@app.route("/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    print(f"[CVPilot Auth] Login attempt for email: '{email}'")

    if not email:
        return jsonify({"error": "Email address is required."}), 400
    if not password:
        return jsonify({"error": "Password is required."}), 400

    db = get_db()
    if not db:
        print("[CVPilot Auth] Login error: Database unavailable")
        return jsonify({"error": "Neon Database is initializing or unreachable. Please retry in a few seconds."}), 503

    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"[CVPilot Auth] Login failed: User '{email}' not found.")
            return jsonify({"error": "No account found with this email. Please create an account first."}), 404

        if not user.check_password(password):
            print(f"[CVPilot Auth] Login failed: Password mismatch for '{email}'.")
            return jsonify({"error": "Incorrect password. Please verify and try again."}), 401

        token = create_jwt_token(user.id, user.email, user.name)
        print(f"[CVPilot Auth] User '{email}' logged in successfully.")

        return jsonify({
            "message": "Logged in successfully!",
            "token": token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        print(f"[CVPilot Auth] Login exception: {e}")
        return jsonify({"error": f"Login failed: {str(e)}"}), 500
    finally:
        db.close()


@app.route("/auth/me", methods=["GET"])
def get_current_user():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"user": user.to_dict()}), 200


# ==========================================================
# RESUME SCANS HISTORY (Neon DB)
# ==========================================================

@app.route("/scans/history", methods=["GET"])
def get_user_history():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    if not db:
        return jsonify({"error": "Database unavailable"}), 503

    try:
        scans = (
            db.query(ResumeScan)
            .filter(ResumeScan.user_id == user.id)
            .order_by(ResumeScan.created_at.desc())
            .all()
        )
        return jsonify({
            "scans": [s.to_dict() for s in scans]
        }), 200
    except Exception as e:
        print(f"[CVPilot History] Error fetching history: {e}")
        return jsonify({"error": "Failed to load past scans"}), 500
    finally:
        db.close()


@app.route("/scans/<int:scan_id>", methods=["DELETE"])
def delete_scan(scan_id):
    user = get_current_user_from_request()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    if not db:
        return jsonify({"error": "Database unavailable"}), 503

    try:
        scan = db.query(ResumeScan).filter(ResumeScan.id == scan_id, ResumeScan.user_id == user.id).first()
        if not scan:
            return jsonify({"error": "Scan record not found"}), 404

        db.delete(scan)
        db.commit()
        return jsonify({"message": "Scan deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to delete scan"}), 500
    finally:
        db.close()


# ==========================================================
# IN-MEMORY RESUME PARSING & AUDIT (ZERO FILE SYSTEM DISK USAGE)
# ==========================================================

@app.route("/upload", methods=["POST"])
def upload_resume():
    try:
        user = get_current_user_from_request()
        if not user:
            return jsonify({
                "error": "Authentication required. Please sign in or create an account to analyze your resume."
            }), 401

        if "resume" not in request.files and "file" not in request.files:
            print(f"[CVPilot Upload] Files missing in request. Files present: {list(request.files.keys())}, Content-Type: {request.content_type}")
            return jsonify({"error": "No resume file detected in upload request. Please select a PDF file."}), 400

        file = request.files.get("resume") or request.files.get("file")
        if not file or file.filename == "":
            return jsonify({"error": "No file selected. Please choose a valid PDF file."}), 400

        # Read file directly into RAM (zero disk storage!)
        file_bytes = file.read()

        # 1. In-memory Resume Parsing
        resume = extract_resume_data(file_bytes)
        resume_text = resume.get("text", "").strip()

        if not resume_text:
            return jsonify({
                "error": "Could not extract text layer from PDF. Please ensure the document is not an image-only scan."
            }), 400

        # 2. Deterministic ATS Analysis
        ats = calculate_ats(resume_text)

        # 3. Selected Job Role / Description
        job_role = request.form.get("job_description", "").strip()

        # 4. Target Role Skills (Instant lookup via cache)
        required_skills = []
        if job_role:
            required_skills = get_required_skills(job_role)

        # 5. Role Match Calculation
        job_match = calculate_job_match(resume_text, required_skills)

        # 6. Recruiter Analysis & Interview Preparation (Gemini with instant fallback)
        ai_result = analyze_resume(resume_text, job_role)

        # 7. Neon Database persistence (if user is logged in)
        user = get_current_user_from_request()
        saved_scan_id = None

        if user:
            db = get_db()
            if db:
                try:
                    new_scan = ResumeScan(
                        user_id=user.id,
                        filename=file.filename,
                        score=ats["score"],
                        grade=ats["grade"],
                        target_role=job_role,
                        candidate_email=resume.get("email", ""),
                        candidate_phone=resume.get("phone", ""),
                        skills=ats["skills"],
                        matched_skills=job_match["matched_skills"],
                        missing_skills=job_match["missing_skills"],
                        suggestions=ats["suggestions"],
                        ai_analysis=ai_result,
                    )
                    db.add(new_scan)
                    db.commit()
                    db.refresh(new_scan)
                    saved_scan_id = new_scan.id
                    print(f"[CVPilot DB] Scan {new_scan.id} saved for user {user.email}")
                except Exception as save_err:
                    db.rollback()
                    print(f"[CVPilot DB] Could not persist scan: {save_err}")
                finally:
                    db.close()

        return jsonify({
            "scan_id": saved_scan_id,
            "filename": file.filename,
            "email": resume.get("email", "Not Found"),
            "phone": resume.get("phone", "Not Found"),
            "score": ats["score"],
            "grade": ats["grade"],
            "skills": ats["skills"],
            "required_skills": required_skills,
            "suggestions": ats["suggestions"],
            "ai_analysis": ai_result,
            "job_match": job_match["match_score"],
            "matched_skills": job_match["matched_skills"],
            "missing_skills": job_match["missing_skills"]
        })

    except Exception as e:
        print(f"[CVPilot] Upload processing error: {e}")
        return jsonify({
            "error": f"An error occurred while analyzing the resume: {str(e)}"
        }), 500


# ==========================================================
# BACKGROUND KEEP-ALIVE DAEMON
# ==========================================================

def keep_alive_worker():
    server_url = os.getenv("SERVER_URL") or os.getenv("RENDER_EXTERNAL_URL")
    if not server_url:
        return

    clean_url = server_url.rstrip("/")
    ping_url = f"{clean_url}/health"
    print(f"[CVPilot Keep-Alive] Daemon started. Pinging {ping_url} every 14 minutes.")

    while True:
        try:
            time.sleep(14 * 60)
            req = urllib.request.Request(
                ping_url,
                headers={"User-Agent": "CVPilot-KeepAlive/1.0"}
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                print(f"[CVPilot Keep-Alive] Heartbeat ping sent: {resp.status}")
        except Exception as e:
            print(f"[CVPilot Keep-Alive] Heartbeat ping note: {e}")


if os.getenv("SERVER_URL") or os.getenv("RENDER_EXTERNAL_URL"):
    t = threading.Thread(target=keep_alive_worker, daemon=True)
    t.start()


if __name__ == "__main__":
    print("[CVPilot] Backend server starting on http://0.0.0.0:5000 (supports localhost:5000 and 127.0.0.1:5000)")
    app.run(host="0.0.0.0", port=5000, debug=True)