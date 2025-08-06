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

  getReceivedMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req.user as any).user_id;
    const { limit, cursor, is_read } = req.query;

    const result = await this.messageService.getReceivedMessages(currentUserId, {
      limit: limit ? parseInt(limit as string, 10) : undefined,
      cursor: cursor ? parseInt(cursor as string, 10) : undefined,
      is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message_id = parseInt(req.params.message_id, 10);
    const user_id = (req.user as any).user_id;

    const result = await this.messageService.markMessageAsRead(message_id, user_id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message_id = parseInt(req.params.message_id, 10);
    const user_id = (req.user as any).user_id;

    const result = await this.messageService.deleteMessage(message_id, user_id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
}