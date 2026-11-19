import API from "./api";

/**
 * Register a new user in Neon DB.
 */
export async function signup(name, email, password) {
  const response = await API.post("/auth/signup", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  if (response.data.token) {
    localStorage.setItem("cvpilot_token", response.data.token);
    localStorage.setItem("cvpilot_user", JSON.stringify(response.data.user));
  }
  return response.data;
}

/**
 * Log in an existing user.
 */
export async function login(email, password) {
  const response = await API.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  if (response.data.token) {
    localStorage.setItem("cvpilot_token", response.data.token);
    localStorage.setItem("cvpilot_user", JSON.stringify(response.data.user));
  }
  return response.data;
}

/**
 * Log out user and clear session.
 */
export function logout() {
  localStorage.removeItem("cvpilot_token");
  localStorage.removeItem("cvpilot_user");
}

/**
 * Get cached user from localStorage.
 */
export function getSavedUser() {
  try {
    const raw = localStorage.getItem("cvpilot_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Verify current session with backend.
 * Only logs out if backend returns 401 Unauthorized (token invalid/expired).
 * On network errors or cold starts, preserves cached user to avoid accidental logout.
 */
export async function fetchCurrentUser() {
  const token = localStorage.getItem("cvpilot_token");
  if (!token) {
    logout();
    return null;
  }

  try {
    const response = await API.get("/auth/me");
    if (response.data?.user) {
      localStorage.setItem("cvpilot_user", JSON.stringify(response.data.user));
      return response.data.user;
    }
    return getSavedUser();
  } catch (err) {
    // If token is explicitly rejected as unauthorized or expired by server
    if (err.response && err.response.status === 401) {
      console.warn("[CVPilot Auth] Session expired. Logging out.");
      logout();
      return null;
    }
    // Network error or cold-start: maintain local cached user session
    return getSavedUser();
  }
}

/**
 * Fetch past resume scans history from Neon DB.
 */
export async function fetchScanHistory() {
  const response = await API.get("/scans/history");
  return response.data.scans || [];
}

/**
 * Delete a past scan from Neon DB.
 */
export async function deleteScanRecord(scanId) {
  const response = await API.delete(`/scans/${scanId}`);
  return response.data;
}
