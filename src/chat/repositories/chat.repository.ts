// repositories/chat.repository.ts
import { PrismaClient } from "@prisma/client";

export class ChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findChatRoomByParticipants(
    user_id1: number,
    user_id2: number
  ) {
    return this.prisma.chatRoom.findFirst({
      where: {
        user_id1,
        user_id2,
      },
    });
  }

  async createChatRoom(
    user_id1: number,
    user_id2: number
  ) {
    return this.prisma.chatRoom.create({
      data: {
        user_id1,
        user_id2,
        last_message_id: null,
      },
    });
  }
}
