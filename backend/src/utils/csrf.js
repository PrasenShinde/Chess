import crypto from "crypto";
import { env } from "../config/env.js";

export const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const setCsrfCookie = (res, token = generateCsrfToken()) => {
  const isProd = env.NODE_ENV === "production";
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const clearCsrfCookie = (res) => {
  const isProd = env.NODE_ENV === "production";
  res.clearCookie("csrfToken", {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
};
