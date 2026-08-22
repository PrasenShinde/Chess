const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

let resolvedApiUrl = "/api";
let resolvedSocketUrl = "http://localhost:3000";

if (rawApiUrl) {
  if (rawApiUrl.startsWith("http://") || rawApiUrl.startsWith("https://")) {
    try {
      const parsed = new URL(rawApiUrl);
      resolvedSocketUrl = parsed.origin;
      resolvedApiUrl = parsed.pathname.endsWith("/api")
        ? rawApiUrl
        : `${parsed.origin}/api`;
    } catch {
      resolvedApiUrl = rawApiUrl;
    }
  } else {
    resolvedApiUrl = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
  }
} else if (!import.meta.env.DEV && typeof window !== "undefined") {
  resolvedSocketUrl = window.location.origin;
}

export const API_URL = resolvedApiUrl;
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || resolvedSocketUrl).trim().replace(/\/+$/, "");
