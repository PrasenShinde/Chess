import crypto from "crypto";
import { env } from "../config/env.js";

export const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const setCsrfCookie = (res, token = generateCsrfToken()) => {
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const clearCsrfCookie = (res) => {
  res.clearCookie("csrfToken", {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};
