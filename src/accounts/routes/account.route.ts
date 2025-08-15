import { Router } from "express";
import { registerAccount, getAccount } from "../controllers/account.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

// POST /api/members/me/accounts
router.post("/accounts", authenticateJwt, registerAccount);
// GET /api/members/me/accounts
router.get("/accounts", authenticateJwt, getAccount);

export default router;