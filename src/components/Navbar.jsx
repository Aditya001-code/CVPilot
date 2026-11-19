import { useState, useEffect } from "react";
import "./Navbar.css";
import { startKeepAlive, pingServer } from "../services/keepAlive";
import { getSavedUser, logout, fetchCurrentUser } from "../services/auth";
import { FiUser, FiClock, FiLogOut } from "react-icons/fi";

function Navbar({ onOpenAuth, onOpenHistory, user, setUser }) {
  const [serverHealth, setServerHealth] = useState({
    status: "checking",
    latency: null,
  });

  useEffect(() => {
    // Initial user check
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      fetchCurrentUser().then((u) => {
        if (u) setUser(u);
      });
    }

    // Keep-alive heartbeat
    const cleanup = startKeepAlive(14, (health) => {
      setServerHealth(health);
    });

    return () => cleanup();
  }, []);

  const handleSignOut = () => {
    logout();
    setUser(null);
  };

  const scrollToUpload = (e) => {
    e.preventDefault();
    const el = document.getElementById("analyzer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStatusClick = () => {
    if (serverHealth.status !== "online") {
      pingServer();
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#analyzer" className="logo" onClick={scrollToUpload}>
          <div className="logo-mark">
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
          <div className="logo-text">
            <span className="brand-name">CVPilot</span>
            <span className="brand-badge">Career Journal</span>
          </div>
        </a>

        <nav className="nav-links">
          <a href="#analyzer">Analyzer</a>
          <a href="#methodology">Methodology</a>
          <a href="#standards">Scoring Rubric</a>
          <a href="#about">About</a>
        </nav>

        <div className="navbar-actions">
          {/* Server Heartbeat Status */}
          <div 
            className={`status-indicator ${serverHealth.status}`}
            onClick={handleStatusClick}
            title={
              serverHealth.status === "online"
                ? `Backend online (${serverHealth.latency}ms). Keep-alive active.`
                : serverHealth.status === "warming"
                ? "Waking up server from free-tier sleep..."
                : "Server offline or sleeping. Click to wake."
            }
            role="button"
            tabIndex={0}
          >
            <span className={`status-dot ${serverHealth.status}`}></span>
            <span className="status-text">
              {serverHealth.status === "online"
                ? "Server Active"
                : serverHealth.status === "warming"
                ? "Warming..."
                : "Server Sleeping"}
            </span>
          </div>

          {/* User Auth & History Actions */}
          {user ? (
            <div className="cv-user-nav-group">
              <button
                className="cv-nav-history-btn"
                onClick={onOpenHistory}
                title="View past scans saved in Neon DB"
              >
                <FiClock /> <span>Past Scans</span>
              </button>

              <div className="cv-user-badge" title={user.email}>
                <div className="cv-user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="cv-user-name">{user.name.split(" ")[0]}</span>
              </div>

              <button
                className="cv-nav-logout-btn"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <FiLogOut />
              </button>
            </div>
          ) : (
            <button
              className="cv-nav-login-btn"
              onClick={onOpenAuth}
            >
              <FiUser /> <span>Sign In</span>
            </button>
          )}

          <a 
            href="#analyzer" 
            className="nav-cta-btn"
            onClick={scrollToUpload}
          >
            New Scan
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;