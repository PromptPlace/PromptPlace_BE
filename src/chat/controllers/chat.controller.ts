import { Request, Response } from "express";
import {
  createOrGetChatRoomService,
} from "../services/chat.service";

import { CreateChatRoomRequestDto } from "../dtos/chat.dto";

export const createOrGetChatRoom = async (
  req: Request, res: Response
):Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: "no user",
      message: "로그인이 필요합니다.",
    });
    return;
  }
  
    try {
        const userId = (req.user as { user_id: number }).user_id;
        const { partner_id } = req.body as CreateChatRoomRequestDto;
        const result = await createOrGetChatRoomService(userId, partnerId);
        res.success(
            {...result},
            "채팅방을 성공적으로 생성/반환했습니다.",
        );
    } catch (err: any) {
        console.error(err);
        res.fail({
            error: err.name || "InternalServerError",
            message: err.message || "채팅방 생성/반환 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
};