import express from "express";
import { signinController } from "../controllers/signin.controller";

const router = express.Router();

router.post("/", signinController.login);
router.post("/initial-setup", signinController.initialSetup); 

export default router;