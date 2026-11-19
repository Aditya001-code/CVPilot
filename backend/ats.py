import re
from skills import SKILLS


def calculate_ats(text):

    text_lower = text.lower()

    found_skills = []

    # -------------------------
    # Skill Detection
    # -------------------------

    for skill in SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)

    score = 0
    suggestions = []

    # -------------------------
    # Technical Skills (40 Marks)
    # -------------------------

    skill_score = min(len(found_skills) * 2, 40)
    score += skill_score

    # -------------------------
    # Email (10)
    # -------------------------

    if re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text):
        score += 10
    else:
        suggestions.append("Add a professional email address.")

    # -------------------------
    # Phone (10)
    # -------------------------

    if re.search(r"\b\d{10}\b", text):
        score += 10
    else:
        suggestions.append("Add a valid phone number.")

    # -------------------------
    # GitHub (5)
    # -------------------------

    if "github" in text_lower:
        score += 5
    else:
        suggestions.append("Add your GitHub profile.")

    # -------------------------
    # LinkedIn (5)
    # -------------------------

    if "linkedin" in text_lower:
        score += 5
    else:
        suggestions.append("Add your LinkedIn profile.")

    # -------------------------
    # Projects (10)
    # -------------------------

    if "project" in text_lower:
        score += 10
    else:
        suggestions.append("Mention your projects.")

    # -------------------------
    # Experience (5)
    # -------------------------

    if "experience" in text_lower or "internship" in text_lower:
        score += 5
    else:
        suggestions.append("Mention internship or work experience if available.")

    # -------------------------
    # Education (5)
    # -------------------------

    education_keywords = [
        "b.tech",
        "btech",
        "b.e",
        "be",
        "m.tech",
        "mca",
        "bca",
        "degree",
        "university",
        "college"
    ]

    if any(word in text_lower for word in education_keywords):
        score += 5
    else:
        suggestions.append("Include your education details.")

    # -------------------------
    # Certifications (5)
    # -------------------------

    if "certification" in text_lower or "certificate" in text_lower:
        score += 5
    else:
        suggestions.append("Add certifications to strengthen your resume.")

    # -------------------------
    # Resume Length (5)
    # -------------------------

    words = len(text.split())

    if words >= 250:
        score += 5
    else:
        suggestions.append("Resume is too short. Add more relevant content.")

    # -------------------------
    # Final Score
    # -------------------------

    score = min(score, 100)

    # -------------------------
    # Grade
    # -------------------------

    if score >= 90:
        grade = "A+"

    elif score >= 80:
        grade = "A"

    elif score >= 70:
        grade = "B"

    elif score >= 60:
        grade = "C"

    else:
        grade = "Needs Improvement"

    return {

        "score": score,

        "grade": grade,

        "skills": found_skills,

        "suggestions": suggestions

    }


# ==========================================================
# Job Description Match With AI
# ==========================================================

def calculate_job_match(resume_text, required_skills):

    # No job role selected
    if not required_skills:
        return {
            "match_score": None,
            "matched_skills": [],
            "missing_skills": []
        }

    resume_lower = resume_text.lower()

    matched = []
    missing = []

    for skill in required_skills:

        if skill.lower() in resume_lower:
            matched.append(skill)
        else:
            missing.append(skill)

    match_score = round(
        (len(matched) / len(required_skills)) * 100
    )

    return {
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing
    }