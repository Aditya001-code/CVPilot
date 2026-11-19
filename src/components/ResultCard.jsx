import { useState } from "react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
  FiCopy,
  FiMail,
  FiPhone,
  FiTarget,
  FiAward,
  FiLayers,
  FiHelpCircle,
  FiTrendingUp,
  FiCheck,
  FiBriefcase
} from "react-icons/fi";
import "./ResultCard.css";

// Helper to parse AI analysis text into structured sections
function parseAiAnalysis(rawText) {
  if (!rawText) return null;

  const sections = {
    summary: "",
    rating: "",
    strengths: [],
    weaknesses: [],
    missingSkills: [],
    suggestions: [],
    interviewQuestions: [],
    careerAdvice: "",
  };

  const lines = rawText.split("\n").map((l) => l.trim());
  let currentKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const lower = line.toLowerCase();
    if (lower.startsWith("resume summary:")) {
      currentKey = "summary";
      const val = line.replace(/resume summary:\s*/i, "").trim();
      if (val) sections.summary = val;
    } else if (lower.startsWith("overall rating:")) {
      currentKey = "rating";
      const val = line.replace(/overall rating:\s*/i, "").trim();
      if (val) sections.rating = val;
    } else if (lower.startsWith("strengths:")) {
      currentKey = "strengths";
    } else if (lower.startsWith("weaknesses:")) {
      currentKey = "weaknesses";
    } else if (lower.startsWith("missing skills:")) {
      currentKey = "missingSkills";
    } else if (lower.startsWith("suggestions:")) {
      currentKey = "suggestions";
    } else if (lower.startsWith("interview questions:")) {
      currentKey = "interviewQuestions";
    } else if (lower.startsWith("career advice:")) {
      currentKey = "careerAdvice";
      const val = line.replace(/career advice:\s*/i, "").trim();
      if (val) sections.careerAdvice = val;
    } else {
      if (currentKey === "summary") {
        sections.summary = sections.summary ? `${sections.summary} ${line}` : line;
      } else if (currentKey === "careerAdvice") {
        sections.careerAdvice = sections.careerAdvice ? `${sections.careerAdvice} ${line}` : line;
      } else if (currentKey === "rating" && !sections.rating) {
        sections.rating = line;
      } else if (
        currentKey === "strengths" ||
        currentKey === "weaknesses" ||
        currentKey === "missingSkills" ||
        currentKey === "suggestions"
      ) {
        const cleaned = line.replace(/^[-*•]\s*/, "").trim();
        if (cleaned) sections[currentKey].push(cleaned);
      } else if (currentKey === "interviewQuestions") {
        const cleaned = line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*•]\s*/, "").trim();
        if (cleaned) sections.interviewQuestions.push(cleaned);
      }
    }
  }

  return sections;
}

function ResultCard({ result, onReset }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [completedItems, setCompletedItems] = useState({});

  if (!result) return null;

  const score = Number(result.score) || 0;
  const grade = result.grade || "N/A";
  const parsedAi = parseAiAnalysis(result.ai_analysis);

  let statusText = "Requires Revision · Improvements Needed";
  let statusTone = "rose";
  if (score >= 85) {
    statusText = "Excellent match";
    statusTone = "emerald";
  } else if (score >= 70) {
    statusText = "Good match";
    statusTone = "emerald";
  } else if (score >= 50) {
    statusText = "Fair match · Improvements needed";
    statusTone = "amber";
  }

  const toggleCheck = (idx) => {
    setCompletedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyEmail = () => {
    if (result.email && result.email !== "Not Found") {
      navigator.clipboard.writeText(result.email);
      toast.success("Email copied to clipboard");
    }
  };

  const copySummary = () => {
    const textToCopy = `CVPilot ATS Score: ${score}/100 (Grade: ${grade})\nStatus: ${statusText}\nSkills Detected: ${(result.skills || []).join(", ")}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Audit summary copied to clipboard");
  };

  // Editorial PDF Dossier generation
  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 18;

      // Header Banner - Forest Green (#24594A)
      doc.setFillColor(36, 89, 74);
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.setTextColor(247, 244, 237); // Warm ivory
      doc.setFont("times", "bold");
      doc.setFontSize(19);
      doc.text("CVPilot — Career Journal", 18, 14);

      doc.setTextColor(220, 229, 216); // Muted sage
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Precision ATS Audit & Candidate Readiness Dossier", 18, 21);

      doc.setTextColor(247, 244, 237);
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), pageWidth - 18, 17, { align: "right" });

      y = 38;

      // Score Callout Box - Warm Ivory surface with thin border
      doc.setDrawColor(220, 225, 215);
      doc.setFillColor(247, 244, 237);
      doc.roundedRect(18, y, pageWidth - 36, 26, 3, 3, "FD");

      doc.setTextColor(38, 39, 33); // Ink
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("ATS COMPATIBILITY SCORE", 25, y + 9);

      doc.setFontSize(20);
      // Forest Green if >= 70, Terracotta if < 60
      if (score >= 70) {
        doc.setTextColor(36, 89, 74);
      } else if (score >= 50) {
        doc.setTextColor(194, 135, 62);
      } else {
        doc.setTextColor(185, 101, 75);
      }
      doc.text(`${score} / 100`, 25, y + 19);

      doc.setFontSize(11);
      doc.setTextColor(90, 89, 83);
      doc.setFont("helvetica", "normal");
      doc.text(`Grade: ${grade}  •  ${score} / 100 — ${statusText}`, 82, y + 16);

      y += 36;

      // Candidate Metadata
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(38, 39, 33);
      doc.text("CANDIDATE SIGNALS", 18, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90, 89, 83);
      doc.text(`Email: ${result.email || "Not Found"}`, 18, y);
      y += 5;
      doc.text(`Phone: ${result.phone || "Not Found"}`, 18, y);
      y += 10;

      // Detected Skills
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(38, 39, 33);
      doc.text(`DETECTED TECHNICAL SKILLS (${result.skills ? result.skills.length : 0})`, 18, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 55);

      if (result.skills && result.skills.length > 0) {
        const skillsString = result.skills.join("  •  ");
        const skillLines = doc.splitTextToSize(skillsString, pageWidth - 36);
        doc.text(skillLines, 18, y);
        y += skillLines.length * 5 + 6;
      } else {
        doc.text("No matching technical skills detected in the document text.", 18, y);
        y += 10;
      }

      // Suggestions
      if (result.suggestions && result.suggestions.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(38, 39, 33);
        doc.text("ACTIONABLE ATS RECOMMENDATIONS", 18, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 55);

        result.suggestions.forEach((sug) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const lines = doc.splitTextToSize(`• ${sug}`, pageWidth - 40);
          doc.text(lines, 20, y);
          y += lines.length * 5 + 1;
        });
        y += 6;
      }

      // Role Match (if present)
      if (result.job_match !== null && result.job_match !== undefined) {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(38, 39, 33);
        doc.text(`TARGET ROLE ALIGNMENT: ${result.job_match}% MATCH`, 18, y);
        y += 6;

        if (result.missing_skills && result.missing_skills.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(185, 101, 75); // Terracotta
          doc.text(`Missing Competencies: ${result.missing_skills.join(", ")}`, 18, y);
          y += 8;
        }
      }

      // Footer
      doc.setFontSize(8.5);
      doc.setTextColor(138, 136, 127);
      doc.text("Generated by CVPilot — Career Journal ATS Intelligence. Confidential candidate evaluation.", pageWidth / 2, 288, { align: "center" });

      doc.save(`CVPilot_Audit_Report.pdf`);
      toast.success("PDF Report downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    }
  };

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <section className="cv-dossier" id="results">
      <div className="cv-dossier-card">
        {/* Dossier Header */}
        <div className="cv-dossier-topbar">
          <div className="cv-dossier-meta">
            <span className="cv-dossier-tag">
              <FiAward className="inline-icon" /> ATS Audit Dossier
            </span>
            <h2 className="cv-dossier-title">Candidate Compatibility Intelligence</h2>
          </div>

          <div className="cv-dossier-actions">
            <button className="cv-btn-secondary" onClick={copySummary} title="Copy Quick Summary">
              <FiCopy /> Copy Summary
            </button>
            <button className="cv-btn-primary" onClick={downloadPDF} title="Download Clean PDF">
              <FiDownload /> Download PDF Report
            </button>
          </div>
        </div>

        {/* Primary Metrics Row */}
        <div className="cv-metrics-grid">
          {/* Main Score Gauge */}
          <div className="cv-metric-card cv-gauge-card">
            <div className="cv-gauge-header">
              <span className="cv-metric-label">Overall ATS Score</span>
              <span className={`cv-grade-badge ${statusTone}`}>Grade {grade}</span>
            </div>

            <div className="cv-gauge-body">
              <div className="cv-svg-gauge-wrapper">
                <svg className="cv-gauge-svg" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    className="cv-gauge-track"
                    strokeWidth="10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    className={`cv-gauge-fill ${statusTone}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div className="cv-gauge-content">
                  <span className="cv-gauge-number">{score}</span>
                  <span className="cv-gauge-total">/100</span>
                </div>
              </div>

              <div className="cv-gauge-verdict">
                <div className={`cv-verdict-title ${statusTone}`}>
                  {score} / 100 · {statusText}
                </div>
                <p className="cv-verdict-desc">
                  {score >= 80
                    ? "Well-structured for modern ATS parsing engines (Workday, Greenhouse, Lever)."
                    : score >= 60
                    ? "Passable baseline, but missing key keyword clusters and sections needed for high ranking."
                    : "High risk of automated rejection. Requires formatting and content remediation."}
                </p>
              </div>
            </div>
          </div>

          {/* Job Match Card (or General Readiness) */}
          <div className="cv-metric-card">
            <div className="cv-metric-header">
              <span className="cv-metric-label">
                <FiTarget className="inline-icon" /> Role Alignment
              </span>
              {result.job_match !== null && result.job_match !== undefined ? (
                <span className="cv-metric-chip">{result.job_match}% Match</span>
              ) : (
                <span className="cv-metric-chip neutral">General Audit</span>
              )}
            </div>

            {result.job_match !== null && result.job_match !== undefined ? (
              <div className="cv-job-match-content">
                <div className="cv-progress-container">
                  <div className="cv-progress-info">
                    <span>Target Competency Coverage</span>
                    <strong>{result.job_match}%</strong>
                  </div>
                  <div className="cv-progress-track">
                    <div
                      className="cv-progress-bar"
                      style={{ width: `${result.job_match}%` }}
                    ></div>
                  </div>
                </div>

                <div className="cv-role-stats">
                  <div className="cv-stat-item">
                    <span className="cv-stat-val text-emerald">
                      {result.matched_skills ? result.matched_skills.length : 0}
                    </span>
                    <span className="cv-stat-lbl">Matched Skills</span>
                  </div>
                  <div className="cv-stat-item">
                    <span className="cv-stat-val text-rose">
                      {result.missing_skills ? result.missing_skills.length : 0}
                    </span>
                    <span className="cv-stat-lbl">Missing Skills</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cv-no-role-content">
                <p className="cv-info-text">
                  No specific job role was selected. To see your exact role fit and missing skill gaps, re-run with a target role selected.
                </p>
                <div className="cv-stat-item-standalone">
                  <span className="cv-stat-val text-primary">{result.skills ? result.skills.length : 0}</span>
                  <span className="cv-stat-lbl">Identified Core Proficiencies</span>
                </div>
              </div>
            )}
          </div>

          {/* Contact & Structure Card */}
          <div className="cv-metric-card">
            <div className="cv-metric-header">
              <span className="cv-metric-label">
                <FiLayers className="inline-icon" /> Parsed Candidate Signals
              </span>
            </div>

            <div className="cv-signals-list">
              <div className="cv-signal-item" onClick={copyEmail} role="button" tabIndex={0}>
                <div className="cv-signal-icon">
                  <FiMail />
                </div>
                <div className="cv-signal-meta">
                  <span className="cv-signal-label">Email Address</span>
                  <span className="cv-signal-value">{result.email || "Not Detected"}</span>
                </div>
              </div>

              <div className="cv-signal-item">
                <div className="cv-signal-icon">
                  <FiPhone />
                </div>
                <div className="cv-signal-meta">
                  <span className="cv-signal-label">Phone Number</span>
                  <span className="cv-signal-value">{result.phone || "Not Detected"}</span>
                </div>
              </div>

              <div className="cv-signal-item">
                <div className="cv-signal-icon">
                  <FiBriefcase />
                </div>
                <div className="cv-signal-meta">
                  <span className="cv-signal-label">Skill Catalog</span>
                  <span className="cv-signal-value">{result.skills ? `${result.skills.length} Technical Skills Found` : "None"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="cv-tabs-bar">
          <button
            className={`cv-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FiAward /> Skills Matrix ({result.skills ? result.skills.length : 0})
          </button>
          <button
            className={`cv-tab-btn ${activeTab === "suggestions" ? "active" : ""}`}
            onClick={() => setActiveTab("suggestions")}
          >
            <FiCheckCircle /> Actionable ATS Fixes ({result.suggestions ? result.suggestions.length : 0})
          </button>
          <button
            className={`cv-tab-btn ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            <FiTrendingUp /> Recruiter Review & Interview Prep
          </button>
        </div>

        {/* Tab 1: Skills Matrix */}
        {activeTab === "overview" && (
          <div className="cv-tab-panel">
            {result.missing_skills && result.missing_skills.length > 0 && (
              <div className="cv-section-box cv-missing-box">
                <div className="cv-box-header">
                  <h4 className="cv-box-title text-rose">
                    <FiAlertTriangle /> Missing Target Competencies ({result.missing_skills.length})
                  </h4>
                  <span className="cv-box-subtitle">
                    Adding these skills in context (with projects or experience) directly boosts your match rate.
                  </span>
                </div>
                <div className="cv-chips-wrap">
                  {result.missing_skills.map((skill, i) => (
                    <span key={i} className="cv-chip chip-missing">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="cv-section-box">
              <div className="cv-box-header">
                <h4 className="cv-box-title">
                  <FiCheckCircle className="text-emerald" /> Detected Technical Competencies
                </h4>
                <span className="cv-box-subtitle">
                  Keywords and tools recognized in your document by the parser.
                </span>
              </div>
              <div className="cv-chips-wrap">
                {result.skills && result.skills.length > 0 ? (
                  result.skills.map((skill, i) => (
                    <span key={i} className="cv-chip chip-detected">
                      <FiCheck className="chip-icon" /> {skill}
                    </span>
                  ))
                ) : (
                  <p className="cv-empty-text">No standard technical keywords were detected in the text layer.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Actionable Suggestions */}
        {activeTab === "suggestions" && (
          <div className="cv-tab-panel">
            <div className="cv-section-box">
              <div className="cv-box-header">
                <h4 className="cv-box-title">ATS Optimization Checklist</h4>
                <span className="cv-box-subtitle">
                  Complete these recommended structural and content edits to maximize your resume score.
                </span>
              </div>

              <div className="cv-checklist">
                {result.suggestions && result.suggestions.length > 0 ? (
                  result.suggestions.map((item, idx) => {
                    const isDone = completedItems[idx];
                    return (
                      <div
                        key={idx}
                        className={`cv-check-row ${isDone ? "completed" : ""}`}
                        onClick={() => toggleCheck(idx)}
                      >
                        <div className={`cv-checkbox ${isDone ? "checked" : ""}`}>
                          {isDone && <FiCheck />}
                        </div>
                        <span className="cv-check-text">{item}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="cv-empty-box">
                    <FiCheckCircle className="text-emerald cv-big-icon" />
                    <h4>All standard ATS checks passed</h4>
                    <p>No critical formatting or structural issues were flagged.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Structured Recruiter Review & Interview Prep */}
        {activeTab === "ai" && (
          <div className="cv-tab-panel">
            {parsedAi ? (
              <div className="cv-ai-structured-deck">
                {/* Executive Summary */}
                {parsedAi.summary && (
                  <div className="cv-section-box cv-summary-callout">
                    <h4 className="cv-box-title">Executive Recruiter Summary</h4>
                    <p className="cv-summary-body">{parsedAi.summary}</p>
                    {parsedAi.rating && (
                      <div className="cv-rating-pill">
                        Recruiter Rating: <strong>{parsedAi.rating}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Strengths & Weaknesses Grid */}
                <div className="cv-two-col-grid">
                  {parsedAi.strengths && parsedAi.strengths.length > 0 && (
                    <div className="cv-section-box border-emerald">
                      <h4 className="cv-box-title text-emerald">
                        <FiCheckCircle /> Key Strengths
                      </h4>
                      <ul className="cv-point-list">
                        {parsedAi.strengths.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedAi.weaknesses && parsedAi.weaknesses.length > 0 && (
                    <div className="cv-section-box border-amber">
                      <h4 className="cv-box-title text-amber">
                        <FiAlertTriangle /> Critical Vulnerabilities
                      </h4>
                      <ul className="cv-point-list">
                        {parsedAi.weaknesses.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Interview Questions */}
                {parsedAi.interviewQuestions && parsedAi.interviewQuestions.length > 0 && (
                  <div className="cv-section-box">
                    <div className="cv-box-header">
                      <h4 className="cv-box-title">
                        <FiHelpCircle className="text-primary" /> Projected Technical Interview Questions
                      </h4>
                      <span className="cv-box-subtitle">
                        Hiring managers are likely to ask these questions based on your stated experience.
                      </span>
                    </div>

                    <div className="cv-questions-list">
                      {parsedAi.interviewQuestions.map((q, i) => (
                        <div key={i} className="cv-question-item">
                          <span className="cv-question-number">Q{i + 1}</span>
                          <span className="cv-question-text">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Advice */}
                {parsedAi.careerAdvice && (
                  <div className="cv-section-box cv-advice-box">
                    <h4 className="cv-box-title">Strategic Career Trajectory Advice</h4>
                    <p className="cv-advice-body">{parsedAi.careerAdvice}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="cv-section-box">
                <h4 className="cv-box-title">Recruiter Review</h4>
                <div className="cv-raw-text">
                  {result.ai_analysis || "No detailed recruiter analysis available."}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ResultCard;