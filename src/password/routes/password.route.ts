import express from "express";
import { passwordController } from "../controllers/password.controller";

const router = express.Router();

router.post("/send-code", passwordController.sendCode);
router.post("/verify-code", passwordController.verifyCode);
router.post("/reset", passwordController.resetPassword);

export default router;