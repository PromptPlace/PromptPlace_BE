import { Service } from "typedi";
import { MessageRepository } from "../repositories/message.repository";
import { AppError } from "../../errors/AppError";

@Service()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async getMessageById(message_id: number, currentUserId: number) {
    const message = await this.messageRepository.findById(message_id);

    if (!message) {
      throw new AppError("존재하지 않는 메시지입니다.", 404, "NotFound");
    }

    if (message.receiver_id !== currentUserId) {
      throw new AppError("해당 메시지에 접근할 수 없습니다.", 403, "Forbidden");
    }

    if (!message.is_read) {
      await this.messageRepository.markAsRead(message_id);
    }

    return {
      message: "메시지 내용 조회 성공",
      message_id: message.message_id,
      title: message.title,
      sender: message.sender.nickname,
      created_at: message.created_at,
      content: message.body,
      is_read: true,
      statusCode: 200,
    };
  }
}