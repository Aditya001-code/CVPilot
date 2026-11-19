import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import ResultCard from "../components/ResultCard";
import API from "../services/api";
import Loader from "../components/Loader";
import Background from "../components/Background";
import toast from "react-hot-toast";

import AuthModal from "../components/AuthModal";
import HistoryDrawer from "../components/HistoryDrawer";
import { getSavedUser } from "../services/auth";

import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiCpu,
  FiSliders,
  FiShield,
  FiX,
  FiChevronDown,
  FiLayers,
  FiTrendingUp,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiZap,
  FiDatabase,
  FiLock,
  FiArrowUp,
  FiActivity,
} from "react-icons/fi";

import "./Home.css";

const ROLE_CATEGORIES = [
  {
    category: "Software Engineering",
    roles: [
      "Frontend Developer",
      "React Developer",
      "Angular Developer",
      "Vue.js Developer",
      "Backend Developer",
      "Node.js Developer",
      "Python Developer",
      "Java Developer",
      "Spring Boot Developer",
      "Full Stack Developer",
      "MERN Stack Developer",
      "Software Engineer",
      "Mobile App Developer",
      "Android Developer",
      "Flutter Developer",
    ],
  },
  {
    category: "Data & Artificial Intelligence",
    roles: [
      "AI Engineer",
      "Machine Learning Engineer",
      "Deep Learning Engineer",
      "Generative AI Engineer",
      "Data Scientist",
      "Data Analyst",
      "Business Analyst",
      "Database Administrator",
      "SQL Developer",
    ],
  },
  {
    category: "Cloud, DevOps & Systems",
    roles: [
      "DevOps Engineer",
      "Cloud Engineer",
      "AWS Cloud Engineer",
      "Azure Cloud Engineer",
      "Site Reliability Engineer",
      "Cybersecurity Analyst",
      "Ethical Hacker",
      "SOC Analyst",
      "Network Engineer",
    ],
  },
  {
    category: "Design, Product & Quality",
    roles: [
      "UI/UX Designer",
      "QA Engineer",
      "Automation Test Engineer",
      "Technical Support Engineer",
      "Game Developer",
      "Blockchain Developer",
      "Embedded Systems Engineer",
    ],
  },
];

function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);

  // User Auth & Neon DB Scan History
  const [user, setUser] = useState(() => getSavedUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!user) {
      toast.error("Please sign in or create an account to analyze resumes.");
      setIsAuthOpen(true);
      return;
    }

    if (droppedFile.type !== "application/pdf" && !droppedFile.name.endsWith(".pdf")) {
      toast.error("Please provide a valid PDF document.");
      return;
    }

    setFile(droppedFile);
    toast.success(`Selected: ${droppedFile.name}`);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!user) {
      toast.error("Please sign in or create an account to analyze resumes.");
      setIsAuthOpen(true);
      return;
    }

    if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
      toast.error("Please provide a valid PDF document.");
      return;
    }

    setFile(selected);
    toast.success(`Selected: ${selected.name}`);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("Please sign in or create an account to run the audit.");
      setIsAuthOpen(true);
      return;
    }

    if (!file) {
      toast.error("Please select or drop a PDF resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    
    // Pass role or custom JD
    const effectiveRole = selectedRole || jobDescription;
    formData.append("job_description", effectiveRole);

    try {
      setLoading(true);
      setResult(null);

      const response = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data);
      toast.success("Resume evaluated successfully!");

      // Scroll smoothly to results
      setTimeout(() => {
        const resEl = document.getElementById("results");
        if (resEl) {
          resEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } catch (err) {
      console.error("Analysis Error:", err);
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        toast.error("Server took too long to respond. It may have been asleep—please try again now that it is warming up.", { duration: 6000 });
      } else {
        toast.error(
          err.response?.data?.error || "Analysis failed. Please check backend connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <>
      <Background />
      <Navbar
        user={user}
        setUser={setUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectScan={(scan) => {
          setResult(scan);
          toast.success("Loaded saved dossier from Neon DB!");
          setTimeout(() => {
            const resEl = document.getElementById("results");
            if (resEl) resEl.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }}
      />

      <main className="cv-main-wrapper">
        {/* ========================================================
            HERO & ANALYZER WORKSPACE
            ======================================================== */}
        <section className="cv-hero-section" id="analyzer">
          <div className="cv-hero-badge">
            <span className="cv-badge-dot"></span>
            <span className="cv-badge-text">CVPilot Engine 2.4 • In-Memory Parsing & Neon DB Persistence</span>
          </div>

          {user ? (
            <div className="cv-user-status-pill">
              <FiDatabase className="inline-icon text-emerald" />
              <span>Signed in as <strong>{user.name}</strong> • Audit history active in Neon Cloud</span>
            </div>
          ) : (
            <div className="cv-guest-hint" onClick={() => setIsAuthOpen(true)}>
              <span>💡 Tip: <span className="hint-link">Sign in</span> to automatically preserve your ATS audit reports in Neon DB.</span>
            </div>
          )}

          <h1 className="cv-hero-headline">
            Navigate hiring algorithms <br />
            <span className="cv-headline-gradient">with precision.</span>
          </h1>

          <p className="cv-hero-subhead">
            CVPilot audits your resume against modern ATS screening filters, detects technical skill coverage,
            scores keyword density, and prepares you for real recruiter evaluations.
          </p>

          {/* Interactive Upload Box */}
          <div className="cv-analyzer-box">
            {/* Dropzone */}
            <div
              className={`cv-dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""} ${!user ? "locked" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!user) {
                  toast("Please sign in or create an account first", { icon: "🔒" });
                  setIsAuthOpen(true);
                  return;
                }
                if (!file) fileInputRef.current?.click();
              }}
            >
              <input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                hidden
                accept=".pdf"
                onChange={handleFileChange}
              />

              {!file ? (
                <div className="cv-dropzone-empty">
                  <div className="cv-upload-icon-circle">
                    {!user ? <FiLock className="cv-upload-icon" /> : <FiUploadCloud className="cv-upload-icon" />}
                  </div>
                  <h3 className="cv-dropzone-heading">
                    {!user ? "Sign In Required to Analyze Resumes" : "Drop your PDF resume here"}
                  </h3>
                  <p className="cv-dropzone-sub">
                    {!user
                      ? "Click here to sign in or create a free account to unlock the analyzer"
                      : "or click to browse from device (PDF format, up to 10MB)"}
                  </p>
                </div>
              ) : (
                <div className="cv-file-selected-card">
                  <div className="cv-file-icon-box">
                    <FiFileText />
                  </div>
                  <div className="cv-file-details">
                    <span className="cv-file-name">{file.name}</span>
                    <span className="cv-file-meta">
                      {formatFileSize(file.size)} • PDF Ready for Parsing
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cv-remove-file-btn"
                    onClick={removeFile}
                    title="Remove selected file"
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>

            {/* Role & Job Match Options */}
            <div className="cv-config-panel">
              <div className="cv-input-group">
                <label className="cv-label" htmlFor="role-select">
                  <FiSliders className="inline-icon" /> Target Job Role (Recommended)
                </label>
                <div className="cv-select-wrapper">
                  <select
                    id="role-select"
                    className="cv-select"
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      if (e.target.value) setJobDescription("");
                    }}
                  >
                    <option value="">Select a target role for tailored benchmarking...</option>
                    {ROLE_CATEGORIES.map((cat) => (
                      <optgroup key={cat.category} label={cat.category}>
                        {cat.roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle Custom Job Description */}
              <div className="cv-jd-toggle-wrap">
                <button
                  type="button"
                  className="cv-jd-toggle-btn"
                  onClick={() => setShowJdInput(!showJdInput)}
                >
                  <FiChevronDown className={`cv-toggle-arrow ${showJdInput ? "open" : ""}`} />
                  <span>Or compare against specific job description text</span>
                </button>

                {showJdInput && (
                  <div className="cv-jd-drawer">
                    <textarea
                      className="cv-textarea"
                      placeholder="Paste the target job description requirements or responsibilities here..."
                      value={jobDescription}
                      onChange={(e) => {
                        setJobDescription(e.target.value);
                        if (e.target.value) setSelectedRole("");
                      }}
                      rows={4}
                    />
                  </div>
                )}
              </div>

              {/* Primary Action Button */}
              {!user ? (
                <button
                  type="button"
                  className="cv-submit-btn cv-auth-req-btn"
                  onClick={() => setIsAuthOpen(true)}
                >
                  <FiLock />
                  <span>Sign In to Unlock CVPilot Analyzer</span>
                </button>
              ) : (
                <button
                  className="cv-submit-btn"
                  onClick={handleUpload}
                  disabled={loading || !file}
                >
                  {loading ? (
                    <>
                      <span className="cv-btn-spinner"></span>
                      <span>Running Diagnostic Engine...</span>
                    </>
                  ) : (
                    <>
                      <FiZap />
                      <span>Run CVPilot Audit</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && <Loader />}

        {/* Results Dossier (Rendered once, cleanly) */}
        {result && !loading && (
          <div ref={resultsRef}>
            <ResultCard result={result} />
          </div>
        )}

        {/* ========================================================
            METHODOLOGY / CORE CAPABILITIES
            ======================================================== */}
        <section className="cv-section" id="methodology">
          <div className="cv-section-header">
            <span className="cv-section-tag">Inspection Methodology</span>
            <h2 className="cv-section-title">How CVPilot Evaluates Your Resume</h2>
            <p className="cv-section-desc">
              Modern Applicant Tracking Systems don't just search words — they evaluate structure, contact signals, and semantic relevance.
            </p>
          </div>

          <div className="cv-features-grid">
            <div className="cv-feature-card">
              <div className="cv-feature-icon-wrapper">
                <FiLayers className="cv-feature-icon" />
              </div>
              <h3 className="cv-feature-title">Structural ATS Compliance</h3>
              <p className="cv-feature-body">
                Audits PDF text layer extraction, section headers, contact information anchors, and readability for systems like Workday, Greenhouse, and Lever.
              </p>
              <div className="cv-feature-metric">Checks 8 critical structural markers</div>
            </div>

            <div className="cv-feature-card">
              <div className="cv-feature-icon-wrapper">
                <FiCpu className="cv-feature-icon" />
              </div>
              <h3 className="cv-feature-title">Target Competency Mapping</h3>
              <p className="cv-feature-body">
                Compares your detected technical skills against standardized skill taxonomies to identify exact missing keywords needed to cross interview thresholds.
              </p>
              <div className="cv-feature-metric">Covers 200+ engineering & data roles</div>
            </div>

            <div className="cv-feature-card">
              <div className="cv-feature-icon-wrapper">
                <FiTrendingUp className="cv-feature-icon" />
              </div>
              <h3 className="cv-feature-title">Recruiter Intelligence Deck</h3>
              <p className="cv-feature-body">
                Simulates real recruiter reviews by highlighting key strengths, flagging formatting vulnerabilities, and generating tailored technical interview questions.
              </p>
              <div className="cv-feature-metric">Tailored interview prep included</div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ATS SCORING RUBRIC
            ======================================================== */}
        <section className="cv-section" id="standards">
          <div className="cv-section-header">
            <span className="cv-section-tag">Scoring Standards</span>
            <h2 className="cv-section-title">The CVPilot ATS Rubric</h2>
            <p className="cv-section-desc">
              Transparent assessment criteria based on real technical recruiter screening rules.
            </p>
          </div>

          <div className="cv-rubric-grid">
            <div className="cv-rubric-card">
              <div className="cv-rubric-pts">40 PTS</div>
              <h4>Technical Skills Density</h4>
              <p>Presence of verified programming languages, frameworks, databases, and domain tools.</p>
            </div>

            <div className="cv-rubric-card">
              <div className="cv-rubric-pts">20 PTS</div>
              <h4>Contact & Profile Integrity</h4>
              <p>Validated professional email address and direct phone contact information.</p>
            </div>

            <div className="cv-rubric-card">
              <div className="cv-rubric-pts">20 PTS</div>
              <h4>Projects & Professional Experience</h4>
              <p>Documented technical project deliverables and verified internship or work history.</p>
            </div>

            <div className="cv-rubric-card">
              <div className="cv-rubric-pts">20 PTS</div>
              <h4>Credentials, Education & Depth</h4>
              <p>Recognized academic degrees, technical certifications, and sufficient content depth (250+ words).</p>
            </div>
          </div>
        </section>

        {/* ========================================================
            ABOUT SECTION
            ======================================================== */}
        <section className="cv-section" id="about">
          <div className="cv-about-card">
            <div className="cv-about-badge">About CVPilot</div>
            <h2 className="cv-about-title">Built for candidates who value clarity over buzzwords.</h2>
            <p className="cv-about-text">
              Most resume tools generate vague, generic hype. CVPilot is an engineering-grade resume analyzer designed to give candidates direct, actionable clarity on how automated screening algorithms read their credentials.
            </p>
            <div className="cv-guarantees-row">
              <div className="cv-guarantee-item">
                <FiCheckCircle className="text-emerald" />
                <span>Zero permanent document storage</span>
              </div>
              <div className="cv-guarantee-item">
                <FiCheckCircle className="text-emerald" />
                <span>Deterministic ATS keyword metrics</span>
              </div>
              <div className="cv-guarantee-item">
                <FiCheckCircle className="text-emerald" />
                <span>Gemini Flash analysis pipeline</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          FOOTER
          ======================================================== */}
      {/* ========================================================
          ENHANCED MODERN EARTHY FOOTER (#14110F)
          ======================================================== */}
      <footer className="cv-footer">
        {/* Pre-footer Architectural Assurance Ribbon */}
        <div className="cv-footer-ribbon">
          <div className="cv-footer-ribbon-container">
            <div className="cv-ribbon-item">
              <FiShield className="cv-ribbon-icon" />
              <div>
                <strong>100% In-Memory Parsing</strong>
                <span>Zero permanent document storage</span>
              </div>
            </div>
            <div className="cv-ribbon-item">
              <FiCpu className="cv-ribbon-icon" />
              <div>
                <strong>Gemini 3.5 Recruiter Engine</strong>
                <span>Live calibrated role match & gaps</span>
              </div>
            </div>
            <div className="cv-ribbon-item">
              <FiDatabase className="cv-ribbon-icon" />
              <div>
                <strong>Neon PostgreSQL Cloud</strong>
                <span>Serverless persistence & instant auth</span>
              </div>
            </div>
            <div className="cv-ribbon-item">
              <FiCheckCircle className="cv-ribbon-icon" />
              <div>
                <strong>ATS Compliance Tested</strong>
                <span>Calibrated for Workday, Greenhouse & Lever</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Container */}
        <div className="cv-footer-container">
          {/* Brand & Purpose Column */}
          <div className="cv-footer-brand">
            <div className="cv-footer-logo">
              <div className="logo-mark small">
                <svg viewBox="0 0 24 24" fill="none" className="logo-svg">
                  <path 
                    d="M12 3L20 19L12 15.5L4 19L12 3Z" 
                    fill="currentColor" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinejoin="round" 
                  />
                  <circle cx="12" cy="12" r="1.5" fill="#191613" />
                </svg>
              </div>
              <div className="cv-footer-brand-title">
                <span className="brand-name">CVPilot</span>
                <span className="brand-sub">Career Journal</span>
              </div>
            </div>
            <p className="cv-footer-desc">
              Engineering-grade ATS diagnostics, keyword density matching, and executive recruiter intelligence built for candidates who value clarity over buzzwords.
            </p>

            <div className="cv-footer-telemetry">
              <div className="cv-telemetry-badge">
                <span className="cv-telemetry-dot"></span>
                <span>Engine v2.4 Active</span>
              </div>
              <span className="cv-telemetry-pill">US-East-1 Neon Pooler</span>
              <span className="cv-telemetry-pill">Gemini 3.5 Core</span>
            </div>
          </div>

          {/* 3 Nav Columns */}
          <div className="cv-footer-nav">
            <div className="cv-footer-col">
              <h5>Diagnostic Suite</h5>
              <a href="#analyzer">ATS Score Audit</a>
              <a href="#analyzer">Role Match Comparator</a>
              <a href="#analyzer">Recruiter Evaluation</a>
              <a href="#analyzer">Keyword Density Scan</a>
              <a href="#analyzer">Executive PDF Export</a>
            </div>

            <div className="cv-footer-col">
              <h5>Scoring Rubric</h5>
              <a href="#standards">Core Tech Skills (40 pts)</a>
              <a href="#standards">Contact Anchors (20 pts)</a>
              <a href="#standards">Experience Depth (20 pts)</a>
              <a href="#standards">Credentials & Ed (20 pts)</a>
              <a href="#standards">Text Layer Readability</a>
            </div>

            <div className="cv-footer-col">
              <h5>Security & Architecture</h5>
              <a href="#about">In-Memory RAM Engine</a>
              <a href="#about">Zero Model Training on CVs</a>
              <a href="#about">Client-Side PDF Generator</a>
              <a href="#about">JWT Session Security</a>
              <a href="#about">Keep-Alive Automated Heartbeat</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar with Back to Top */}
        <div className="cv-footer-bottom">
          <div className="cv-footer-bottom-container">
            <p className="cv-copyright">
              © {new Date().getFullYear()} CVPilot • Modern Earthy Edition (Espresso & Amber). Built for high-impact candidates.
            </p>

            <button 
              type="button" 
              className="cv-back-to-top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              title="Return to top of page"
            >
              <span>Back to top</span>
              <FiArrowUp />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
