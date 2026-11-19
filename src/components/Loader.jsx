import { useState, useEffect } from "react";
import "./Loader.css";
import { FiCheck, FiInfo } from "react-icons/fi";

const STAGES = [
  { id: 1, title: "Parsing document structure & text layer", detail: "Reading raw PDF streams and layout anchors..." },
  { id: 2, title: "Calculating ATS compliance & keyword density", detail: "Auditing contact data, formatting, and structural markers..." },
  { id: 3, title: "Cross-referencing technical skills & role benchmarks", detail: "Matching domain competencies against industry standards..." },
  { id: 4, title: "Generating recruiter intelligence & interview prep", detail: "Synthesizing executive review and actionable suggestions..." },
];

function Loader() {
  const [activeStage, setActiveStage] = useState(0);
  const [showColdStartHint, setShowColdStartHint] = useState(false);

  useEffect(() => {
    const intervals = [900, 1600, 2400];
    const timers = intervals.map((delay, index) => 
      setTimeout(() => setActiveStage(index + 1), delay)
    );

    // If request takes longer than 6 seconds (server was cold/sleeping)
    const coldStartTimer = setTimeout(() => {
      setShowColdStartHint(true);
    }, 6000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(coldStartTimer);
    };
  }, []);

  return (
    <div className="cv-loader-overlay">
      <div className="cv-loader-card">
        {/* Header */}
        <div className="cv-loader-header">
          <div className="cv-loader-spinner-wrapper">
            <div className="cv-spinner-ring"></div>
            <div className="cv-spinner-core"></div>
          </div>
          <div>
            <h3 className="cv-loader-title">CVPilot Engine Scanning</h3>
            <p className="cv-loader-subtitle">Evaluating candidate signals against ATS criteria</p>
          </div>
        </div>

        {/* Cold-start notification if server was asleep */}
        {showColdStartHint && (
          <div className="cv-cold-start-banner">
            <FiInfo className="cv-cold-start-icon" />
            <span>
              Warming up backend server... First scan after inactivity takes ~15-25 seconds on free-tier hosting. Keep-alive is now active.
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="cv-loader-progress-track">
          <div 
            className="cv-loader-progress-bar" 
            style={{ width: `${Math.min(95, (activeStage + 1) * 24)}%` }}
          ></div>
        </div>

        {/* Diagnostic Steps */}
        <div className="cv-loader-steps">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStage;
            const isCurrent = idx === activeStage;
            const isPending = idx > activeStage;

            return (
              <div 
                key={stage.id} 
                className={`cv-step-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isPending ? "pending" : ""}`}
              >
                <div className="cv-step-icon">
                  {isCompleted ? (
                    <FiCheck className="cv-check-icon" />
                  ) : isCurrent ? (
                    <div className="cv-step-pulse"></div>
                  ) : (
                    <div className="cv-step-dot"></div>
                  )}
                </div>
                <div className="cv-step-content">
                  <div className="cv-step-title">{stage.title}</div>
                  {isCurrent && <div className="cv-step-detail">{stage.detail}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="cv-loader-footer">
          <span>Processing securely • Auto-refresh keeps server warm every 14 mins</span>
        </div>
      </div>
    </div>
  );
}

export default Loader;