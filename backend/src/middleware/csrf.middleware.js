const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
};
