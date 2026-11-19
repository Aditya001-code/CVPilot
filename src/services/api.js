import axios from "axios";

// Intelligently resolve backend host to avoid localhost vs 127.0.0.1 mismatch in browsers
let defaultApi = "http://localhost:5000";
if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
  defaultApi = "http://127.0.0.1:5000";
}

const API_URL = import.meta.env.VITE_API_URL || defaultApi;

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://resumeiq-ai-backend-xk29.onrender.com",
  timeout: 50000,
});

// Automatically inject JWT token into request headers if user is logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cvpilot_token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { API_URL };
export default API;
