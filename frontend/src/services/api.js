import { API_URL } from "../config";

export { API_URL };

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh",
  "/auth/csrf",
];

const shouldRefreshAfterUnauthorized = (endpoint) => {
  return !AUTH_ENDPOINTS.includes(endpoint);
};

let refreshPromise = null;
let sessionExpiredHandler = null;

export const onSessionExpired = (handler) => {
  sessionExpiredHandler = handler;
};

export const getCsrfToken = () => {
  const match = document.cookie.match(/(?:^|; )csrfToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
};

export const ensureCsrfToken = async () => {
  if (getCsrfToken()) {
    return getCsrfToken();
  }

  const response = await fetch(`${API_URL}/auth/csrf`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to initialize CSRF token");
  }

  const data = await response.json();
  return data.csrfToken || getCsrfToken();
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": await ensureCsrfToken(),
        },
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      return response.json();
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const fetchApi = async (endpoint, options = {}, hasRetried = false) => {
  const url = `${API_URL}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers["X-CSRF-Token"] = await ensureCsrfToken();
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && !hasRetried && shouldRefreshAfterUnauthorized(endpoint)) {
    try {
      await refreshAccessToken();
      return fetchApi(endpoint, options, true);
    } catch {
      sessionExpiredHandler?.();
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "An error occurred");
  }

  return response.json();
};

export const authService = {
  login: (email, password) => {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: (username, email, password) => {
    return fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  logout: () => {
    return fetchApi("/auth/logout", {
      method: "POST",
    });
  },

  me: () => {
    return fetchApi("/auth/me", {
      method: "GET",
    });
  },
};

export const gameService = {
  getStats: () => fetchApi("/games/stats"),
  getRecentGames: () => fetchApi("/games/recent"),
};
