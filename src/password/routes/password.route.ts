import express from "express";
import { passwordController } from "../controllers/password.controller";

const router = express.Router();

router.post("/password/send-code", passwordController.sendCode);
router.post("/password/verify-code", passwordController.verifyCode);
router.post("/password/reset", passwordController.resetPassword);

export default router;