export const API_URL = "/api";

// Helper for generic API requests with credentials (cookies)
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: "include", // This is REQUIRED for sending HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

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
