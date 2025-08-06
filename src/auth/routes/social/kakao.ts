import { Router } from "express";
import passport from "passport";
import AuthController from "../../controllers/auth.controller";

const router = Router();

// GET /api/auth/login/kakao
router.get("/", passport.authenticate("kakao", { session: false }));

// GET /api/auth/login/kakao/callback
router.get(
  "/callback",
  passport.authenticate("kakao", { session: false }),
  AuthController.kakaoCallback
);

export default router;
