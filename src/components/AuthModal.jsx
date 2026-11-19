import { useState } from "react";
import toast from "react-hot-toast";
import { FiX, FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { login, signup } from "../services/auth";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTabChange = (toLogin) => {
    setIsLogin(toLogin);
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email format (e.g. name@example.com).");
      return;
    }

    if (!isLogin && !cleanName) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (isLogin) {
        res = await login(cleanEmail, password);
        toast.success(`Welcome back, ${res.user.name || cleanEmail}!`);
      } else {
        res = await signup(cleanName, cleanEmail, password);
        toast.success(`Account created successfully! Welcome, ${res.user.name}.`);
      }

      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      console.error("[CVPilot Auth Error]", err);

      // Network / Offline / Port Mismatch error
      if (err.code === "ERR_NETWORK" || !err.response) {
        toast.error(
          "Cannot reach backend server. Please make sure python app.py is running on port 5000.",
          { duration: 6000 }
        );
        return;
      }

      // Explicit backend error messages
      const status = err.response?.status;
      const backendError = err.response?.data?.error || err.response?.data?.message;

      if (backendError) {
        toast.error(backendError, { duration: 5000 });
        return;
      }

      if (status === 404) {
        toast.error("No account found with this email. Please click 'Create Account' to register.");
      } else if (status === 401) {
        toast.error("Incorrect password. Please verify and try again.");
      } else if (status === 409) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else if (status === 503) {
        toast.error("Neon Database is initializing. Please wait a moment and retry.");
      } else {
        toast.error(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cv-modal-backdrop" onClick={onClose}>
      <div className="cv-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="cv-modal-close" onClick={onClose} aria-label="Close modal">
          <FiX />
        </button>

        <div className="cv-modal-header">
          <div className="cv-modal-badge">Neon Cloud Identity</div>
          <h3 className="cv-modal-title">
            {isLogin ? "Sign In to CVPilot" : "Create CVPilot Account"}
          </h3>
          <p className="cv-modal-sub">
            {isLogin
              ? "Access your saved ATS scans, candidate dossiers, and recruiter benchmarks."
              : "Sync your scan history and track your ATS improvement over time."}
          </p>
        </div>

        {/* Tab switch */}
        <div className="cv-modal-tabs">
          <button
            type="button"
            className={`cv-tab-item ${isLogin ? "active" : ""}`}
            onClick={() => handleTabChange(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`cv-tab-item ${!isLogin ? "active" : ""}`}
            onClick={() => handleTabChange(false)}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cv-modal-form">
          {!isLogin && (
            <div className="cv-form-group">
              <label className="cv-form-label">Full Name</label>
              <div className="cv-input-wrapper">
                <FiUser className="cv-input-icon" />
                <input
                  type="text"
                  className="cv-form-input"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="cv-form-group">
            <label className="cv-form-label">Email Address</label>
            <div className="cv-input-wrapper">
              <FiMail className="cv-input-icon" />
              <input
                type="email"
                className="cv-form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="cv-form-group">
            <div className="cv-password-label-row">
              <label className="cv-form-label">Password</label>
              <span className="cv-password-hint">Min. 6 characters</span>
            </div>
            <div className="cv-input-wrapper">
              <FiLock className="cv-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="cv-form-input cv-password-input"
                placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 chars)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
              <button
                type="button"
                className="cv-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="cv-modal-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="cv-btn-loading-text">
                <span className="cv-btn-spinner"></span>
                <span>Authenticating with Neon...</span>
              </span>
            ) : (
              <>
                <span>{isLogin ? "Sign In to Journal" : "Create My Account"}</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="cv-modal-switch-prompt">
          {isLogin ? (
            <span>
              Don't have an account yet?{" "}
              <button
                type="button"
                className="cv-switch-link"
                onClick={() => handleTabChange(false)}
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                type="button"
                className="cv-switch-link"
                onClick={() => handleTabChange(true)}
              >
                Sign in here
              </button>
            </span>
          )}
        </div>

        <div className="cv-modal-footer">
          <span>Protected with bcrypt password hashing on Neon PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
