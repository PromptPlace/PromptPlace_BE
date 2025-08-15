import { Router } from "express";
import { registerAccount, getAccount, updateAccount } from "../controllers/account.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

// POST /api/members/me/accounts
router.post("/accounts", authenticateJwt, registerAccount);
// GET /api/members/me/accounts
router.get("/accounts", authenticateJwt, getAccount);
// PATCH /api/members/me/accounts
router.patch("/accounts", authenticateJwt, updateAccount);

export default router;