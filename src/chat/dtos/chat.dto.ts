export interface CreateChatRoomRequestDto {
  partner_id: number;
}

export interface ChatRoomResponseDto {
  room_id: number;
  is_new: boolean;
}