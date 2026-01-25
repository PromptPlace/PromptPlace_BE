import { AttachmentType } from "@prisma/client";

export type ChatFilterType = "all" | "unread" | "pinned";

// == 채팅방 생성

export interface CreateChatRoomRequestDto {
  partner_id: number;
}

export interface ChatRoomResponseDto {
  room_id: number;
  is_new: boolean;
}

// == 채팅방 상세 

export interface ChatRoomDto {
  room_id: number;
  created_at: string;
  is_pinned: boolean;
}

export interface MyChatInfoDto {
  user_id: number;
  left_at: string | null;
}

export interface ChatPartnerDto {
  user_id: number;
  nickname: string;
  profile_image_url: string | null;
  role: "USER" | "ADMIN";
}

export interface BlockStatusDto {
  i_blocked_partner: boolean;
  partner_blocked_me: boolean;
}

export interface ChatAttachmentDto {
  attachment_id: number;
  url: string;
  type: "IMAGE" | "FILE";
  original_name: string;
  size: number;
  created_at: string;
}

export interface ChatMessageDto {
  message_id: number;
  sender_id: number;
  content: string;
  sent_at: string;
  attachments: ChatAttachmentDto[];
}

export interface ChatPageDto {
  has_more: boolean;
  total_count: number;
}

export interface GetChatDetailRequestDto {
  room_id: number;
  cursor?: number;
  limit?: number;
}

export class ChatRoomDetailResponseDto {
  room!: ChatRoomDto;
  my!: MyChatInfoDto;
  partner!: ChatPartnerDto;
  block_status!: BlockStatusDto;
  messages!: ChatMessageDto[];
  page!: ChatPageDto;

  static from(params: {
    roomDetail: any;
    userId: number;
    blockInfo: { iBlockedPartner: boolean; partnerBlockedMe: boolean };
    messages: any[];
    hasMore: boolean;
  }): ChatRoomDetailResponseDto {
    const { roomDetail, userId, blockInfo, messages, hasMore } = params;

    const isUser1Me = roomDetail.user_id1 === userId;
    const meInfo = roomDetail.participants?.find((p: any) => p.user_id === userId);
    const partnerUser = isUser1Me ? roomDetail.user2 : roomDetail.user1;

    const dto = new ChatRoomDetailResponseDto();

    dto.room = {
      room_id: roomDetail.room_id,
      created_at: roomDetail.created_at.toISOString(),
      is_pinned: meInfo?.is_pinned ?? false,
    };

    dto.my = {
      user_id: userId,
      left_at: meInfo?.left_at ? meInfo.left_at.toISOString() : null,
    };

    dto.partner = {
      user_id: partnerUser.user_id,
      nickname: partnerUser.nickname,
      profile_image_url: partnerUser.profileImage?.url ?? null,
      role: partnerUser.role === "ADMIN" ? "ADMIN" : "USER",
    };

    dto.block_status = {
      i_blocked_partner: blockInfo.iBlockedPartner,
      partner_blocked_me: blockInfo.partnerBlockedMe,
    };

    dto.messages = (messages ?? []).map((msg: any) => ({
      message_id: msg.message_id,
      sender_id: msg.sender_id,
      content: msg.content ?? "",
      sent_at: msg.sent_at.toISOString(),
      attachments: (msg.attachments ?? []).map((at: any) => ({
        attachment_id: at.attachment_id,
        url: at.url,
        type: at.type, //  "IMAGE" | "FILE"
        original_name: at.name,
        size: at.size,
        created_at: at.created_at.toISOString(),
      })),
    }));

    dto.page = {
      has_more: hasMore,
      total_count: dto.messages.length,
    };

    return dto;
  }
}

// == 채팅방 목록

export interface ChatRoomListPartnerDto {
  user_id: number;
  nickname: string;
  profile_image_url: string;
}

export interface ChatRoomListLastMessageDto {
  content: string;
  sent_at: string;
  has_attachments: boolean;
}

export interface ChatRoomListItemDto{
  room_id: number;
  partner: ChatRoomListPartnerDto;
  last_message: ChatRoomListLastMessageDto | null;
  unread_count: number;
  is_pinned: boolean;
}

export interface GetChatRoomListRequestDto {
  filter?: ChatFilterType;
  search?: string;
  cursor?: number;
  limit?: number;
}

export class ChatRoomListResponseDto {
  rooms!: ChatRoomListItemDto[];
  page!: ChatPageDto;

  static from(params: {
    userId: number;
    roomsInfo: any[];
    totalRoom: number;
    hasMore: boolean;
  }): ChatRoomListResponseDto {
    const { userId, roomsInfo, totalRoom, hasMore } = params;    
    const dto = new ChatRoomListResponseDto();

    dto.rooms = roomsInfo.map((p) => {
      const room = p.chatRoom;
      
      const partnerData = room.participants.find((part: any) => part.user_id !== userId);

      const lastMsg = room.lastMessage ? {
        content: room.lastMessage.content,
        sent_at: room.lastMessage.sent_at,
        has_attachments: room.lastMessage.attachments.length > 0
      } : null;

      return {
        room_id: room.room_id,
        partner: {
          user_id: partnerData?.user.user_id || 0,
          nickname: partnerData?.user.nickname || "알 수 없는 사용자",
          profile_image_url: partnerData?.user.profileImage || null,
        },
        last_message: lastMsg,
        unread_count: p.unread_count,
        is_pinned: p.is_pinned
      };
    });

    dto.page = {
      has_more: hasMore,
      total_count: totalRoom
    };

    return dto;
  }
}

// == 채팅방 고정 토글 
export interface TogglePinResponseDto {
  is_pinned: boolean;
}