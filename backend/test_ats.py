import pytest
from ats import calculate_ats, calculate_job_match

def test_calculate_ats_empty():
    result = calculate_ats("")
    assert result["score"] == 0
    assert result["grade"] == "Needs Improvement"
    assert len(result["skills"]) == 0
    # Suggestions should be many since nothing is present
    assert len(result["suggestions"]) > 0

def test_calculate_ats_full():
    text = "test@example.com 9876543210 github linkedin project experience b.tech certification " + "word " * 250
    # Include some skills
    # Need to know some skills from SKILLS array, let's assume 'python', 'java' are in it
    text += " python java sql"
    result = calculate_ats(text)
    # The score should be higher, grade likely A or A+ depending on skill matching
    assert result["score"] > 50
    assert "Add a professional email address." not in result["suggestions"]
    assert "Add a valid phone number." not in result["suggestions"]

def test_calculate_job_match():
    resume = "I am a software engineer with Python and SQL experience."
    required_skills = ["Python", "SQL", "AWS"]
    
    result = calculate_job_match(resume, required_skills)
    assert result["match_score"] == 67 # 2/3 * 100 = 67
    assert "Python" in result["matched_skills"]
    assert "SQL" in result["matched_skills"]
    assert "AWS" in result["missing_skills"]

def test_calculate_job_match_empty_skills():
    resume = "I am a software engineer."
    result = calculate_job_match(resume, [])
    assert result["match_score"] is None
