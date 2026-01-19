export interface CreateChatRoomRequestDto {
  partner_id: number;
}

export interface ChatRoomResponseDto {
  room_id: number;
  is_new: boolean;
}

export interface GetChatDetailRequestDto {
  room_id: number;
  cursor?: number;
  limit?: number;
}

export interface ChatRoomDetailResponseDto {
  room: ChatRoomDto;
  my: MyChatInfoDto;
  parter: ChatPartnerDto;
  block_status: BlockStatusDto;
  messages: ChatMessageDto[];
  page: ChatPageDto;
}

export interface ChatRoomDto {
  room_id: number;
  created_at: string;
  is_pinned: boolean;
}

export interface MyChatInfoDto {
  user_id: number;
  last_read_message_id: number | null;
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

export interface ChatMessageDto {
  message_id: number;
  sender_id: number;
  content: string;
  sent_at: string;
  attachments: ChatAttachmentDto[];
}

export interface ChatAttachmentDto {
  attachment_id: number;
  url: string;
  type: "IMAGE" | "FILE"; 
  original_name: string;
  size: number;
  created_at: string;
}

export interface ChatPageDto {
  has_more: boolean;
  total_message: number;
}