import { Service } from "typedi";
import { CreateMessageDto } from "../dtos/message.dto";
import { PrismaClient, Message } from "@prisma/client";

@Service()
export class MessageRepository {
private prisma = new PrismaClient();
  /**
   * 메시지 생성
   */
  async createMessage(data: CreateMessageDto): Promise<Message> {
    return this.prisma.message.create({
      data: {
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        title: data.title,
        body: data.body,
      },
    });
  }

  /**
   * 메시지 단건 조회
   */
  async findById(message_id: number): Promise<(Message & { sender: { nickname: string } }) | null> {
  return this.prisma.message.findUnique({
    where: { message_id },
    include: {
      sender: {
        select: {
          nickname: true, 
        },
      },
    },
  });
}

  /**
   * 유저의 받은 메시지 목록
   */
  async findReceivedMessages(user_id: number): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        receiver_id: user_id,
        is_deleted: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * 메시지 읽음 처리
   */
  async markAsRead(message_id: number): Promise<Message> {
    return this.prisma.message.update({
      where: { message_id },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  /**
   * 메시지 삭제 (소프트 딜리트)
   */
  async softDelete(message_id: number): Promise<Message> {
    return this.prisma.message.update({
      where: { message_id },
      data: {
        is_deleted: true,
      },
    });
  }

  /**
 * 메시지 목록 조회 (커서 기반 페이지네이션)
 */
async findReceivedMessagesWithCursor(params: {
  receiver_id: number;
  limit: number;
  cursor?: number;
  is_read?: boolean;
}): Promise<{ messages: (Message & { sender: { nickname: string } })[]; hasNextPage: boolean }> {
  const { receiver_id, limit, cursor, is_read } = params;

  const where: any = {
    receiver_id,
    is_deleted: false,
  };

  if (typeof is_read === "boolean") {
    where.is_read = is_read;
  }

  const messages = await this.prisma.message.findMany({
    where,
    take: limit + 1, // 다음 페이지 존재 여부 확인용
    ...(cursor && {
      cursor: { message_id: cursor },
      skip: 1,
    }),
    include: {
      sender: {
        select: {
          nickname: true,
        },
      },
    },
    orderBy: {
      message_id: 'desc', // 최신 메시지 순
    },
  });

  const hasNextPage = messages.length > limit;

  return {
    messages: hasNextPage ? messages.slice(0, limit) : messages,
    hasNextPage,
  };
}
}