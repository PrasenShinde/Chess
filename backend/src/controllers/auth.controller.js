import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { env } from "../config/env.js";
import { hashToken } from "../utils/tokens.js";

const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      token: hashToken(token),
      userId,
      expiresAt,
    },
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Check if token exists in DB (prevents reuse of revoked tokens)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashToken(refreshToken) },
    });

    if (!storedToken || storedToken.expiresAt <= new Date()) {
      // Possible token reuse attack, invalidate all user tokens (optional but recommended)
      await prisma.refreshToken.deleteMany({ where: { userId: decoded.userId } });
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Token rotation: delete old token, issue new ones
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, newRefreshToken);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: hashToken(refreshToken) },
      });
    }
    clearAuthCookies(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    // Redirect to frontend dashboard
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

export const me = async (req, res) => {
  // Provided by requireAuth middleware
  res.status(200).json({ user: req.user });
};
