import "./ResultCard.css";
import jsPDF from "jspdf";

import {
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaLightbulb,
  FaRobot,
  FaChartLine,
  FaDownload,
  FaBriefcase,
  FaStar,
} from "react-icons/fa";

function ResultCard({ result }) {

  if (!result) return null;

const score = result.score || 0;
const grade = result.grade || "N/A";

let color = "#ef4444";
let status = "Needs Improvement";

if (score >= 90) {
  color = "#22c55e";
  status = "Excellent";
} else if (score >= 80) {
  color = "#22c55e";
  status = "Very Good";
} else if (score >= 60) {
  color = "#facc15";
  status = "Good";
}

  const downloadPDF = () => {

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(22);
    doc.text("ResumeIQ AI Report",20,y);

    y += 15;

    doc.setFontSize(16);
    doc.text(`ATS Score : ${score}%`,20,y);

    y += 10;
    doc.text(`Grade : ${grade}`,20,y);

    y += 10;
    doc.text(`Status : ${status}`,20,y);

    y += 15;

    doc.text(`Email : ${result.email || "Not Found"}`,20,y);

    y += 10;

    doc.text(`Phone : ${result.phone || "Not Found"}`,20,y);

    y += 15;

    doc.setFontSize(18);
    doc.text("Detected Skills",20,y);

    y += 10;

    if(result.skills.length>0){

      result.skills.forEach(skill=>{

        doc.setFontSize(12);

        doc.text("• "+skill,25,y);

        y+=8;

      });

    }

    y += 10;

    doc.setFontSize(18);

    doc.text("Suggestions",20,y);

    y += 10;

    result.suggestions.forEach(item=>{

      const lines=doc.splitTextToSize(item,165);

      doc.setFontSize(11);

      doc.text(lines,25,y);

      y+=lines.length*7;

    });

    y+=10;

    doc.setFontSize(18);

    doc.text("AI Analysis",20,y);

    y+=10;

    const ai=result.ai_analysis || "No AI Analysis";

    const aiLines=doc.splitTextToSize(ai,170);

    doc.setFontSize(10);

    doc.text(aiLines,20,y);

    doc.save("ResumeIQ_AI_Report.pdf");

  };
    return (
    <div className="result-card">

      <h2 className="title">
        <FaChartLine /> Resume Analysis Dashboard
      </h2>

      <p className="subtitle">
        AI Powered ATS Evaluation Report
      </p>

      <div className="dashboard">

        {/* ATS Score */}

        <div className="score-section">

          <div
            className="circle"
            style={{
              background: `conic-gradient(${color} ${score * 3.6}deg,#334155 0deg)`
            }}
          >

            <div className="inner-circle">

              <h1>{score}%</h1>

              <span>ATS Score</span>

              <small className="score-status">
                {status}
              </small>

            </div>

          </div>

          <div className="grade-box">

            <h2>
              <FaStar /> Grade : {grade}
            </h2>

            <p>{status}</p>

            <div className="progress">

              <div
                className="progress-fill"
                style={{
                  width: `${score}%`,
                  background: color,
                }}
              ></div>

            </div>

          </div>

        </div>

        {/* Contact */}

        <div className="info-section">

          <div className="info-card">

            <h3>
              <FaEnvelope /> Email
            </h3>

            <p>{result.email || "Not Found"}</p>

          </div>

          <div className="info-card">

            <h3>
              <FaPhone /> Phone
            </h3>

            <p>{result.phone || "Not Found"}</p>

          </div>

        </div>

      </div>

      {/* Skills */}

      <div className="section">

        <h3>
          <FaCheckCircle />
          {" "}
          Detected Skills
          ({result.skills.length})
        </h3>

        <div className="skills">

          {result.skills && result.skills.length > 0 ? (

            result.skills.map((skill, index) => (

              <span key={index}>{skill}</span>

            ))

          ) : (

            <p>No Skills Detected</p>

          )}

        </div>

      </div>

      {/* Suggestions */}

      <div className="section">

        <h3>
          <FaLightbulb />
          {" "}
          ATS Suggestions
          ({result.suggestions.length})
        </h3>

        <ul>

          {result.suggestions && result.suggestions.length > 0 ? (

            result.suggestions.map((item, index) => (

              <li key={index}>{item}</li>

            ))

          ) : (

            <li>No Suggestions</li>

          )}

        </ul>

      </div>
            {/* AI Analysis */}
      {result.job_match !== null && result.job_match !== undefined && (

        <div className="section">

          <h3>
            <FaBriefcase /> Job Description Match
          </h3>

          <div className="job-card">

            <div className="job-score">

              <h2>{result.job_match}%</h2>

              <span>Resume Match</span>

            </div>

            <div className="progress">

              <div
                className="progress-fill"
                style={{
                  width: `${result.job_match}%`
                }}
              ></div>

            </div>

            <h4>Missing Skills</h4>

            <div className="skills">

              {result.missing_skills &&
              result.missing_skills.length > 0 ? (

                result.missing_skills.map((skill, index) => (
                  <span key={index}>{skill}</span>
                ))

              ) : (

                <p>No Missing Skills 🎉</p>

              )}

            </div>

          </div>

        </div>

      )}

      <div className="section ai-card">

        <h3>
          <FaRobot /> AI Resume Analysis
        </h3>

        <pre className="ai-output">

          {result.ai_analysis
            ? result.ai_analysis
            : "AI Analysis not available."}

        </pre>

      </div>

      {/* Download PDF */}

      <div className="download-section">

        <button
          className="download-btn"
          onClick={downloadPDF}
        >
          <FaDownload />
          Download PDF Report
        </button>

      </div>

    </div>
  );
}

export default ResultCard;