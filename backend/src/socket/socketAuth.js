import cookie from "cookie";
import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../prisma/client.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie;
    
    if (!rawCookies) {
      return next(new Error("Authentication error: No cookies found"));
    }

    const parsedCookies = cookie.parse(rawCookies);
    const accessToken = parsedCookies.accessToken;

    if (!accessToken) {
      return next(new Error("Authentication error: Access token missing"));
    }

    const decoded = verifyAccessToken(accessToken);
    
    if (!decoded) {
      return next(new Error("Authentication error: Invalid or expired access token"));
    }

    // Fetch user from DB to ensure they still exist and get details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true, rating: true }
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user to socket object
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error);
    next(new Error("Authentication error: Internal server error"));
  }
};
