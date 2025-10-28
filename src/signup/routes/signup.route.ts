import express from "express";
import { signupController } from "../controllers/signup.controller";

const router = express.Router();


router.post("/send-code", signupController.sendCode);

router.post("/verify-code", signupController.verifyCode);

router.post("/register", signupController.register);

export default router;