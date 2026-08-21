const rawApiUrl = import.meta.env.VITE_API_URL || "/api";

export const API_URL = rawApiUrl;

let defaultSocketUrl = "http://localhost:3000";
if (rawApiUrl.startsWith("http")) {
  try {
    const parsed = new URL(rawApiUrl);
    defaultSocketUrl = parsed.origin;
  } catch (err) {
    console.error("Invalid VITE_API_URL format", err);
  }
} else if (!import.meta.env.DEV && typeof window !== "undefined") {
  defaultSocketUrl = window.location.origin;
}

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;
