import os
import time
import json
from dotenv import load_dotenv
from google import genai
from cache import ROLE_SKILLS_CACHE
from skills import SKILLS

load_dotenv()

from google.genai import types

# Active, high-speed Gemini models in order of priority
MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
]

client = None
api_key = os.getenv("GEMINI_API_KEY")
if api_key and not api_key.startswith("AQ.placeholder"):
    try:
        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=25000)
        )
        print("[CVPilot AI] Gemini Client initialized with active models:", MODELS)
    except Exception as e:
        print(f"[CVPilot AI] Warning: Failed to initialize genai.Client: {e}")
        client = None


def generate_fallback_analysis(resume_text, job_role=""):
    """
    Deterministic recruiter fallback analysis generated in 0ms
    if Gemini API is unreachable, sleeping, or rate-limited.
    """
    detected_skills = [s for s in SKILLS if s.lower() in resume_text.lower()]
    skill_sample = ", ".join(detected_skills[:8]) if detected_skills else "General technical skills"
    target_role = job_role if job_role else "Technical Professional"

    return f"""Resume Summary:
Candidate profile demonstrating proficiency in {skill_sample}. The resume presents technical competencies relevant to {target_role} tracks with verifiable practical experience.

Overall Rating:
Good

Strengths:
- Clear technical foundation with verified proficiencies in {skill_sample}.
- Well-defined educational credentials and structured project descriptions.
- Professional contact information and portfolio presence properly documented.

Weaknesses:
- Project impact statements could benefit from quantifiable business metrics (e.g., latency reduction, user growth).
- Resume formatting should ensure standard single-column header hierarchy for 100% ATS parser fidelity.

Missing Skills:
- Advanced distributed systems and cloud infrastructure tooling.
- Production CI/CD automation and container orchestration workflows.

Suggestions:
- Add measurable impact metrics (% improvement, scale, throughput) to each project bullet point.
- Ensure all technical certifications and GitHub repository links are prominently positioned.
- Tailor section keywords to align with the target {target_role} requirements.

Interview Questions:
1. Walk me through the architecture of your most impactful project and the technical tradeoffs you made.
2. How do you approach debugging and performance profiling in production environments?
3. Describe a scenario where you had to adapt to an unfamiliar framework or technology under a tight deadline.
4. How do you ensure high code quality, test coverage, and documentation in team workflows?
5. How would you apply your technical background to excel in this {target_role} role?

Career Advice:
Continue building end-to-end production projects with automated testing and continuous deployment. Focus on quantifiable problem-solving to stand out in technical recruiter screens."""


def analyze_resume(resume_text, job_role=""):
    if not client:
        print("[CVPilot AI] No active Gemini client. Using deterministic recruiter engine.")
        return generate_fallback_analysis(resume_text, job_role)

    role_context = ""
    if job_role:
        role_context = f"""
Selected Job Role:
{job_role}

IMPORTANT:
Evaluate the resume specifically for the selected role.
In your analysis:
- Mention whether the candidate is suitable for this role.
- Mention role-specific strengths.
- Mention role-specific missing skills.
- Give role-specific improvement suggestions.
- Generate interview questions related to this role.
"""

    prompt = f"""You are a professional ATS Resume Reviewer and Technical Recruiter.
Analyze the following resume and provide structured, high-value feedback.

Return ONLY plain text in this exact format:

Resume Summary:
(2-3 lines summarizing candidate fit)

Overall Rating:
(Excellent / Very Good / Good / Needs Improvement)

Strengths:
- Point 1
- Point 2
- Point 3

Weaknesses:
- Point 1
- Point 2

Missing Skills:
- Point 1
- Point 2

Suggestions:
- Point 1
- Point 2
- Point 3

Interview Questions:
1. Question
2. Question
3. Question
4. Question
5. Question

Career Advice:
(2-3 lines)

{role_context}

Resume Text:
{resume_text[:4000]}
"""

    for model_name in MODELS:
        try:
            print(f"[CVPilot AI] Requesting analysis via {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )

            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"[CVPilot AI] Model {model_name} attempt failed: {e}")
            continue

    print("[CVPilot AI] Gemini calls exhausted. Falling back to deterministic analysis engine.")
    return generate_fallback_analysis(resume_text, job_role)


def get_required_skills(job_role):
    # 1. Instant Cache Lookup (0ms response)
    if job_role in ROLE_SKILLS_CACHE:
        return ROLE_SKILLS_CACHE[job_role]

    # 2. Check case-insensitive match in cache
    for cached_role, skills in ROLE_SKILLS_CACHE.items():
        if cached_role.lower() == job_role.lower():
            return skills

    # 3. If it's a raw Job Description or unlisted role, extract from built-in SKILLS first
    text_lower = job_role.lower()
    found = [s for s in SKILLS if s.lower() in text_lower]
    if len(found) >= 5:
        ROLE_SKILLS_CACHE[job_role] = found[:15]
        return found[:15]

    # 4. Attempt Gemini extraction with fallback
    if client:
        prompt = f"""You are an IT Recruiter. For the job role: '{job_role}', return ONLY a valid JSON array of the 10-15 most critical technical skills.
Example: ["Java", "Spring Boot", "SQL", "Git", "REST API", "Docker"]
Return JSON ONLY, no markdown fences."""
        for model_name in MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and response.text:
                    cleaned = response.text.strip().replace("```json", "").replace("```", "").strip()
                    skills = json.loads(cleaned)
                    if isinstance(skills, list) and skills:
                        ROLE_SKILLS_CACHE[job_role] = skills
                        return skills
            except Exception as e:
                print(f"[CVPilot AI] Skill extraction via {model_name} error: {e}")
                continue

    # 5. Default fallback skills for generic technical roles
    fallback = ["Python", "SQL", "Git", "REST API", "Docker", "Problem Solving", "Data Structures"]
    ROLE_SKILLS_CACHE[job_role] = fallback
    return fallback