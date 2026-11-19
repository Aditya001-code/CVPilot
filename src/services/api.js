import axios from "axios";

// Use the local backend during local development and CVPilot backend in production.
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const defaultApi = isLocalHost
  ? "http://localhost:5000"
  : "https://cvpilot-6thv.onrender.com";

const API_URL = import.meta.env.VITE_API_URL || defaultApi;

const API = axios.create({
  baseURL: API_URL,
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
