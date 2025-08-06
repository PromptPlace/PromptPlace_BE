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
}