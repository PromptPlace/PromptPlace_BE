import { ChatRepository } from "../repositories/chat.repository";
import { AppError } from "../../errors/AppError";
import { 
  ChatRoomResponseDto,
  ChatRoomDetailResponseDto,
  ChatRoomListResponseDto,
  ChatFilterType,
} from "../dtos/chat.dto";

export class ChatService {
  constructor(private readonly chatRepo: ChatRepository) {}

  // == 채팅방 생성
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

  // == 채팅방 상세 조회
  async getChatRoomDetailService(
    roomId: number, userId: number, cursor?: number, limit: number = 20
  ):Promise<ChatRoomDetailResponseDto> {
    const roomDetail = await this.chatRepo.findRoomDetailWithParticipant(roomId);
    if (!roomDetail) {
      throw new AppError("채팅방을 찾을 수 없습니다.", 404, "NotFoundError");
    }

    // my, partner 구분
    const isUser1Me = roomDetail.user_id1 === userId;
    const me = isUser1Me ? roomDetail.user1 : roomDetail.user2;
    const partner = isUser1Me ? roomDetail.user2 : roomDetail.user1;

    const myId = me.user_id;
    const partnerId = partner.user_id;

    // 차단 정보 및 메세지 목록
    const [blockInfo, messageInfo] = await Promise.all([
      this.chatRepo.blockStatus(myId, partnerId),
      this.chatRepo.findMessagesByRoomId(roomId, cursor, limit, myId),
    ]);
    
    // 페이지네이션 
    const hasMore = messageInfo.messages.length > limit;
    const messages = hasMore ? messageInfo.messages.slice(0, limit) : messageInfo.messages;

    return ChatRoomDetailResponseDto.from({
      roomDetail,
      userId,
      blockInfo,
      messages,
      hasMore,
    });
  }

  // == 채팅방 목록 조회
  async getChatRoomListService(
    userId: number, cursor?: number, limit: number = 20, filter: ChatFilterType = "all", search?: string
  ):Promise<ChatRoomListResponseDto> {
    const roomList = await this.chatRepo.findRoomListByUserId(
      userId, {
        cursor, 
        limit, 
        filter,
        search
      });

    
    // 페이지네이션 
    const hasMore = roomList.rooms.length > limit;
    const roomsInfo = hasMore ? roomList.rooms.slice(0, limit) : roomList.rooms;

    return ChatRoomListResponseDto.from({
      userId,
      roomsInfo,
      totalRoom: roomList.totalRoom,
      hasMore,
    });
  }

  // == 상대방 차단
  async blockUserService(
    blockerId: number, blockedId: number
  ): Promise<void> {
    const blockStatus = await this.chatRepo.blockStatus(blockerId, blockedId);
    if (blockStatus.iBlockedPartner) {
      throw new AppError("이미 차단한 사용자입니다.", 400, "BadRequest");
    }
    await this.chatRepo.blockUser(blockerId, blockedId);
  }
}

export const chatService = new ChatService(new ChatRepository());

