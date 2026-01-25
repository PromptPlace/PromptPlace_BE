import { ChatRepository } from "../repositories/chat.repository";
import { AppError } from "../../errors/AppError";
import { 
  ChatRoomResponseDto,
  ChatRoomDetailResponseDto,
  ChatRoomListResponseDto,
  ChatFilterType,
  TogglePinResponseDto,
} from "../dtos/chat.dto";
import { getPresignedUrl } from "../../middlewares/s3.util";
import { mapMimeTypeToEnum } from "../../utils/map";

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

    const updateReadStatus = !cursor ? this.chatRepo.resetUnreadCount(roomId, myId, roomDetail.last_message_id) :  Promise.resolve();

    // 1. 차단 정보 조회 2. 메세지 목록 조회 3. 안읽은 메세지 초기화
    const [blockInfo, messageInfo] = await Promise.all([
      this.chatRepo.blockStatus(myId, partnerId),
      this.chatRepo.findMessagesByRoomId(roomId, cursor, limit, myId),
      updateReadStatus
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

  // == 채팅방 나가기
  async leaveChatRoomService(
    roomId: number, userId: number
  ): Promise<void> {
    const roomDetail = await this.chatRepo.findRoomDetailWithParticipant(roomId);
    if (!roomDetail) {
      throw new AppError("채팅방을 찾을 수 없습니다.", 404, "NotFoundError");
    }
    await this.chatRepo.leaveChatRoom(roomId, userId);
  }

  // == S3 presigned URL 발급
  async getPresignedUrlService(files: { fileName: string; contentType: string}[]) {
    const attatchments = await Promise.all(
      files.map(async (f) => {
        const {url, key} = await getPresignedUrl(f.fileName, f.contentType);

        return {
          name: f.fileName,
          url: url,
          key: key,
        };
      })
    );
    return { attatchments };
  }

  // == 채팅방 고정 토글
  async togglePinChatRoomService(
    roomId: number, userId: number
  ): Promise<TogglePinResponseDto> {
    const roomDetail = await this.chatRepo.findRoomDetailWithParticipant(roomId);
    if (!roomDetail) {
      throw new AppError("채팅방을 찾을 수 없습니다.", 404, "NotFoundError");
    }

    const isPinned = roomDetail.participants.some((p) => p.user_id === userId && p.is_pinned); // 현재 고정 상태
    const togglePinned = (await this.chatRepo.togglePinChatRoom(roomId, userId, isPinned)).is_pinned
    return {is_pinned: togglePinned};
  }

  // == 읽음 처리
  async resetUnreadCountService(roomId: number, userId: number): Promise<void> {
    await this.chatRepo.resetUnreadCount(roomId, userId);
  }

  // == 메세지 저장
  async saveMessageService(
    params: {
      roomId: number;
      senderId: number;
      content: string;
      files: { key: string; contentType: string; name: string; size: number }[]
    }
  ) {
    const { roomId, senderId, content, files } = params;
    const s3BaseUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/`;
    const formattedFiles = files.map((f) => ({
      url: `${s3BaseUrl}${f.key}`, // URL 생성
      name: f.name,               
      size: f.size,               
      contentType: mapMimeTypeToEnum(f.contentType)
    }))

    return this.chatRepo.saveMessage(roomId, senderId, content, formattedFiles);
  }
}

export const chatService = new ChatService(new ChatRepository());

