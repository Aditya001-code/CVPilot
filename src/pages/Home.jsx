import { useState } from "react";
import Navbar from "../components/Navbar";
import ResultCard from "../components/ResultCard";
import API from "../services/api";
import Loader from "../components/Loader";
import Background from "../components/Background";
import toast from "react-hot-toast";


import {
  FaRobot,
  FaUpload,
  FaChartLine,
  FaFilePdf,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

import "./Home.css";

function Home() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const roles = [
  "Frontend Developer",
  "React Developer",
  "Angular Developer",
  "Vue.js Developer",
  "Backend Developer",
  "Java Developer",
  "Spring Boot Developer",
  "Python Developer",
  "Django Developer",
  "Flask Developer",
  "Node.js Developer",
  "PHP Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "MEAN Stack Developer",
  "Software Engineer",
  "Software Developer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Deep Learning Engineer",
  "Generative AI Engineer",
  "Data Scientist",
  "Data Analyst",
  "Business Analyst",
  "DevOps Engineer",
  "Cloud Engineer",
  "AWS Cloud Engineer",
  "Azure Cloud Engineer",
  "Cybersecurity Analyst",
  "Ethical Hacker",
  "SOC Analyst",
  "Network Engineer",
  "Mobile App Developer",
  "Android Developer",
  "Flutter Developer",
  "UI/UX Designer",
  "QA Engineer",
  "Automation Test Engineer",
  "Database Administrator",
  "SQL Developer",
  "Blockchain Developer",
  "Embedded Systems Engineer",
  "Game Developer",
  "Site Reliability Engineer",
  "Technical Support Engineer",
  "IT Support Engineer"];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }

    setFile(droppedFile);
  };

  const handleUpload = async () => {

    if (!file) {
      toast.error("Please select a PDF Resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDescription);

    try {

      setLoading(true);

      const response = await API.post("/upload", formData);

      setResult(response.data);

      toast.success("Resume analyzed successfully!");

    }catch (err) {

      console.log("Error:", err);

      console.log("Status:", err.response?.status);

      console.log("Response:", err.response?.data);

      toast.error("Upload Failed");

    } finally {

      setLoading(false);

    }

  };

  return (
    
    <>
      <Background />
      <Navbar />
      <div className="home" id="home">

        <section className="hero">

          <h1>
            Resume<span>IQ AI</span>
          </h1>

          <p>
            AI Powered Resume Analyzer that calculates ATS Score,
            detects technical skills and provides personalized
            suggestions to improve your resume.
          </p>

          <div className="upload-box">

            <label
              htmlFor="resume-upload"
              className="drop-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >

              <FaFilePdf className="pdf-icon" />

              <h2>Drag & Drop Resume Here</h2>

              <p>or Click to Browse PDF</p>

              <input
                id="resume-upload"
                type="file"
                hidden
                accept=".pdf"
                onChange={(e) => {
                    const selected = e.target.files[0];

                    if (!selected) return;

                    if (selected.type !== "application/pdf") {
                      toast.error("Please upload a PDF file only.");
                      return;
                    }

                    setFile(selected);
                  }}
              />

            </label>

            {file && (
              <p className="selected-file">
                ✅ {file.name}
              </p>
            )}
      
            <div className="role-box">

              <h3>💼 Select Job Role</h3>

              <select
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              >
                <option value="">Select a Role</option>

                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}

              </select>

            </div>

            <div className="jd-box">

              <h3>🎯 Job Description (Optional)</h3>

              <textarea
                placeholder="Or paste complete Job Description here (Optional)"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
              />

            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
            >

              {loading
                ? "Analyzing Resume..."
                : "Analyze Resume"}

            </button>

          </div>

        </section>

        {loading && <Loader />}

        {result && !loading && <ResultCard result={result} />}

        <section
          id="features"
          className="features"
        >
                    <div className="card">

            <FaUpload className="icon" />

            <h2>Easy Upload</h2>

            <p>
              Upload your Resume securely in PDF format.
            </p>

          </div>

          <div className="card">

            <FaRobot className="icon" />

            <h2>AI Analysis</h2>

            <p>
              Gemini AI analyzes your resume and provides
              detailed feedback.
            </p>

          </div>

          <div className="card">

            <FaChartLine className="icon" />

            <h2>ATS Score</h2>

            <p>
              Get your ATS Score with suggestions to improve
              your resume.
            </p>

          </div>

        </section>

        <section
          id="about"
          className="about"
        >

          <h2>About ResumeIQ AI</h2>

          <p>

            ResumeIQ AI is an AI Powered Resume Analyzer
            built using React, Flask, Python and Google Gemini AI.

            It extracts candidate information,
            detects technical skills,
            calculates ATS score,
            and generates intelligent resume feedback
            to help students prepare for placements.

          </p>

        </section>

        {loading && <Loader />}

        {result && !loading && <ResultCard result={result} />}

        <footer id="footer" className="footer">

          <h2>
            Resume<span>IQ AI</span>
          </h2>

          <p>
            AI Powered Resume Analyzer built with React, Flask & Gemini AI.
          </p>

          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </div>

          <div className="footer-social">

            <a
              href="https://github.com/YOUR_GITHUB_USERNAME"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub />
            </a>

            <a
              href="https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME"
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedin />
            </a>

            <a href="mailto:your@email.com">
              <FaEnvelope />
            </a>

          </div>

          <p className="copyright">
            © 2026 ResumeIQ AI • Developed by Aditya Srivastava
          </p>

        </footer>

      </div>

    </>
  );
}

export default Home;