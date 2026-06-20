import { Router } from "express";
import passport from "passport";
import * as authController from "../controllers/auth.controller.js";
import { validate, registerSchema, loginSchema } from "../validators/auth.validator.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { setCsrfCookie } from "../utils/csrf.js";

const router = Router();

router.get("/csrf", (req, res) => {
  const token = setCsrfCookie(res);
  res.status(200).json({ csrfToken: token });
});

router.post("/register", authRateLimiter, csrfProtection, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, csrfProtection, validate(loginSchema), authController.login);
router.post("/refresh", authRateLimiter, authController.refresh);
router.post("/logout", csrfProtection, authController.logout);

router.get("/me", requireAuth, authController.me);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/callback/google",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.googleCallback,
);

export default router;
