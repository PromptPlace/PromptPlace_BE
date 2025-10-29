import express from "express";
import { signinController } from "../controllers/signin.controller";
import { authenticateJwt } from '../../config/passport';

const router = express.Router();

router.post("/", signinController.login);
router.post("/initial-setup", authenticateJwt, signinController.initialSetup); 

export default router;