import { Service } from "typedi";
import { ChatRepository } from "../repositories/chat.repository";

import { 
  ChatRoomResponseDto 
} from "../dtos/chat.dto";

@Service()
export class ChatService {
  constructor(private readonly chatRepo: ChatRepository) {}
  async createOrGetChatRoomService(
    userId: number, partnerId: number
  ): Promise<ChatRoomResponseDto> {
    const userId1 = Math.min(userId, partnerId);
    const userId2 = Math.max(userId, partnerId);

    const existingRoom = await this.chatRepo.findChatRoomByParticipants(userId1, userId2);
    
    if (existingRoom) { // 존재하는 채팅방이 있으면 반환
      return {
        room_id: existingRoom.room_id,
        is_new: false,
      };
    }

    // 없으면 새로 생성
    const newRoom = await this.chatRepo.createChatRoom(userId1, userId2);
    return {
      room_id: newRoom.room_id,
      is_new: true,
    };
  }
}