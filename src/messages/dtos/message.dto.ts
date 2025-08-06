export interface CreateMessageDto {
  sender_id: number;
  receiver_id: number;
  title: string;
  body: string;
}