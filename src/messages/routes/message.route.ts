import { Router } from "express";
import { Container } from "typedi";
import { MessageController } from "../controllers/message.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();
const messageController = Container.get(MessageController);

router.get('/', authenticateJwt, messageController.getReceivedMessages); 
router.get("/:message_id", authenticateJwt, messageController.getMessageById);

export default router;