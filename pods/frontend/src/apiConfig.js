// Centralized API Base URL configuration
const hostname = typeof window !== "undefined" && window.location ? window.location.hostname : "localhost";

const isLocalhost = Boolean(
    hostname === "localhost" ||
    hostname === "[::1]" ||
    hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export const API_BASE = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL 
    : (isLocalhost ? `http://${hostname}:9000` : "https://cafefinder-u2me.onrender.com");

export const getApiUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${API_BASE}${cleanEndpoint}`;
};
