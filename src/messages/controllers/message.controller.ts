import { Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import { MessageService } from "../services/message.service";

@Service()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  getMessageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message_id = parseInt(req.params.message_id, 10);
      const currentUserId = (req.user as any).user_id;

      const message = await this.messageService.getMessageById(message_id, currentUserId);

      res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  };
}