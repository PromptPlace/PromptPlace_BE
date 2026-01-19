import { Router } from "express";
import { createOrGetChatRoom } from "../controllers/chat.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

router.post("/api/chat/rooms", createOrGetChatRoom);

export default router;