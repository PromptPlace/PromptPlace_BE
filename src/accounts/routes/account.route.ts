import { Router } from "express";
import { registerAccount } from "../controllers/account.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

router.post("/accounts", authenticateJwt, registerAccount);

export default router;