import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../prisma/client.js";

export const requireAuth = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Require auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};
