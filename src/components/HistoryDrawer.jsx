import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX, FiClock, FiTrash2, FiExternalLink, FiFileText, FiAward } from "react-icons/fi";
import { fetchScanHistory, deleteScanRecord } from "../services/auth";
import "./HistoryDrawer.css";

function HistoryDrawer({ isOpen, onClose, onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchScanHistory();
      setScans(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load past scans from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, scanId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this scan record from Neon DB?")) return;

    try {
      await deleteScanRecord(scanId);
      setScans((prev) => prev.filter((s) => s.id !== scanId));
      toast.success("Scan record deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cv-drawer-backdrop" onClick={onClose}>
      <div className="cv-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cv-drawer-header">
          <div>
            <div className="cv-drawer-tag">Neon DB Persistence</div>
            <h3 className="cv-drawer-title">Past Resume Scans</h3>
          </div>
          <button className="cv-drawer-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="cv-drawer-body">
          {loading ? (
            <div className="cv-drawer-loading">
              <div className="cv-spinner-ring"></div>
              <span>Querying Neon Database...</span>
            </div>
          ) : scans.length === 0 ? (
            <div className="cv-drawer-empty">
              <FiFileText className="cv-empty-icon" />
              <h4>No scans recorded yet</h4>
              <p>Upload a resume while signed in and your ATS audit reports will be preserved here permanently.</p>
            </div>
          ) : (
            <div className="cv-drawer-list">
              {scans.map((scan) => {
                const score = scan.score || 0;
                const tone = score >= 80 ? "emerald" : score >= 60 ? "amber" : "rose";
                const dateStr = scan.created_at
                  ? new Date(scan.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <div
                    key={scan.id}
                    className="cv-history-item"
                    onClick={() => {
                      onSelectScan(scan);
                      onClose();
                    }}
                  >
                    <div className="cv-history-top">
                      <span className="cv-history-filename">{scan.filename}</span>
                      <span className={`cv-history-score ${tone}`}>
                        {score}% ({scan.grade})
                      </span>
                    </div>

                    <div className="cv-history-meta">
                      <span className="cv-history-role">
                        {scan.target_role || "General ATS Audit"}
                      </span>
                      <span className="cv-history-date">
                        <FiClock className="inline-icon" /> {dateStr}
                      </span>
                    </div>

                    <div className="cv-history-actions">
                      <button
                        className="cv-open-report-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScan(scan);
                          onClose();
                        }}
                      >
                        <FiExternalLink /> Open Dossier
                      </button>
                      <button
                        className="cv-delete-report-btn"
                        onClick={(e) => handleDelete(e, scan.id)}
                        title="Delete record from Neon"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryDrawer;
