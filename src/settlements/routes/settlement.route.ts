import { Router } from "express";
import { SettlementController } from "../controllers/settlement.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

// GET /api/settlements/sales
router.get('/sales', authenticateJwt, SettlementController.getSalesHistory);

export default router;