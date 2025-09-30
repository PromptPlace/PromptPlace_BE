import { Service } from "typedi";
import { CreateMessageDto } from "../dtos/message.dto";
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

  async getReceivedMessages(currentUserId: number, query: {
  limit?: number;
  cursor?: number;
  is_read?: boolean;
}) {
  const limit = query.limit ?? 10;
  const cursor = query.cursor;
  const is_read = query.is_read;

  const { messages, hasNextPage } = await this.messageRepository.findReceivedMessagesWithCursor({
    receiver_id: currentUserId,
    limit,
    cursor,
    is_read,
  });

  return {
    message: "메시지 목록 조회 성공",
    messages: messages.map(msg => ({
      message_id: msg.message_id,
      title: msg.title,
      sender: msg.sender.nickname,
      created_at: msg.created_at.toISOString().split('T')[0], // 날짜만
      is_read: msg.is_read,
    })),
    pagination: {
      nextCursor: hasNextPage ? messages[messages.length - 1].message_id : null,
      limit,
    },
    statusCode: 200,
  };
}

async markMessageAsRead(message_id: number, currentUserId: number) {
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
    message: "메시지가 읽음 처리되었습니다.",
    statusCode: 200,
  };
}

async deleteMessage(message_id: number, currentUserId: number) {
  const message = await this.messageRepository.findById(message_id);

  if (!message) {
    throw new AppError("존재하지 않는 메시지입니다.", 404, "NotFound");
  }

  if (message.receiver_id !== currentUserId) {
    throw new AppError("해당 메시지를 삭제할 권한이 없습니다.", 403, "Forbidden");
  }

  await this.messageRepository.softDelete(message_id);

  return {
    message: "메시지가 성공적으로 삭제되었습니다.",
    statusCode: 200,
  };
}

async sendMessage(currentUserId: number, data: CreateMessageDto) {
  if (currentUserId !== data.sender_id) {
    throw new AppError("요청자 정보가 일치하지 않습니다.", 403, "Forbidden");
  }

  const message = await this.messageRepository.createMessage(data);

  return {
    message: "메시지 전송 성공",
    message_id: message.message_id,
    statusCode: 201,
  };
}
}