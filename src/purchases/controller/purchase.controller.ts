import { Request, Response, NextFunction } from "express";
import { PurchaseHistoryService } from "../services/purchase.service";
import { PurchaseHistoryResponseDTO } from "../dtos/purchase.dto";

export const PurchaseHistoryController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const userId= (req.user as any).user_id;
            const result: PurchaseHistoryResponseDTO = await PurchaseHistoryService.list(userId);
            res.status(result.statusCode).json(result);
        } catch (err) {
            next(err);
        }
    }
}