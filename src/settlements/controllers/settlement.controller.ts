import { Request, Response } from "express";
import { SettlementService } from "../services/settlement.service";

export const SettlementController = {
  async getSalesHistory(req: Request, res: Response) {
    const user = req.user; 
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await SettlementService.getSalesByUserId(user.user_id);
    return res.status(200).json(result);
  }
};