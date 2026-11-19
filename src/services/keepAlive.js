import API from "./api";

let heartbeatTimer = null;
const listeners = new Set();

let currentStatus = {
  status: "checking", // 'online' | 'warming' | 'offline' | 'checking'
  latency: null,
  lastPing: null,
  error: null,
};

function notifyListeners() {
  listeners.forEach((fn) => fn({ ...currentStatus }));
}

/**
 * Pings the API server health check endpoint to keep it awake.
 */
export async function pingServer() {
  currentStatus.status = "warming";
  notifyListeners();

  const startTime = Date.now();
  try {
    const response = await API.get("/health", { timeout: 25000 });
    const latency = Date.now() - startTime;

    currentStatus = {
      status: "online",
      latency,
      lastPing: new Date(),
      error: null,
    };
    console.log(`[CVPilot Keep-Alive] Server heartbeat OK (${latency}ms) at ${new Date().toLocaleTimeString()}`);
    notifyListeners();
    return { success: true, latency, data: response.data };
  } catch (err) {
    // Fallback: try root / endpoint
    try {
      const response = await API.get("/", { timeout: 25000 });
      const latency = Date.now() - startTime;

      currentStatus = {
        status: "online",
        latency,
        lastPing: new Date(),
        error: null,
      };
      notifyListeners();
      return { success: true, latency, data: response.data };
    } catch (fallbackErr) {
      currentStatus = {
        status: "offline",
        latency: null,
        lastPing: new Date(),
        error: err.message,
      };
      console.warn("[CVPilot Keep-Alive] Server ping warning:", err.message);
      notifyListeners();
      return { success: false, error: err.message };
    }
  }
}

/**
 * Starts an automatic recurring keep-alive pinger.
 * Default interval is 14 minutes (840,000 ms) so that free-tier servers
 * (like Render, which shut down after 15 minutes of inactivity) NEVER go to sleep.
 *
 * @param {number} intervalMinutes - Minutes between each ping (default: 14)
 * @param {function} onStatusChange - Optional callback for status changes
 * @returns {function} Cleanup function to stop keep-alive
 */
export function startKeepAlive(intervalMinutes = 14, onStatusChange = null) {
  if (onStatusChange) {
    listeners.add(onStatusChange);
    // Send immediate initial status
    onStatusChange({ ...currentStatus });
  }

  // Clear any existing timer
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  // 1. Send immediate wake-up ping on application load
  pingServer();

  // 2. Set interval to ping every 14 minutes
  const intervalMs = intervalMinutes * 60 * 1000;
  console.log(`[CVPilot Keep-Alive] Heartbeat active: pinging server every ${intervalMinutes} minutes.`);

  heartbeatTimer = setInterval(() => {
    console.log(`[CVPilot Keep-Alive] 14-min interval reached. Pinging backend to prevent sleep...`);
    pingServer();
  }, intervalMs);

  // Return teardown function
  return () => {
    if (onStatusChange) {
      listeners.delete(onStatusChange);
    }
  };
}

export function subscribeToHealth(fn) {
  listeners.add(fn);
  fn({ ...currentStatus });
  return () => listeners.delete(fn);
}

export function getHealthStatus() {
  return { ...currentStatus };
}
