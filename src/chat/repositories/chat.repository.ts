import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { ChatFilterType } from "../dtos/chat.dto";

export class ChatRepository {
  async findChatRoomByParticipants(userId1: number, userId2: number) {
    return prisma.chatRoom.findFirst({
      where: {
        user_id1: userId1,
        user_id2: userId2,
      },
    });
  }

  async createChatRoom(userId1: number, userId2: number) {
    return prisma.chatRoom.create({
      data: {
        user_id1: userId1,
        user_id2: userId2,
        last_message_id: null,
      },
    });
  }

  async findRoomDetailWithParticipant(roomId: number) {
    return prisma.chatRoom.findUnique({
      where: { room_id: roomId },
      include: {
        user1: true,
        user2: true,
        participants: true,
      },
    });
  }

  async findMessagesByRoomId(roomId: number, cursor?: number, limit: number = 20) {
    const hasCursor = cursor !== undefined && cursor !== null && cursor !== 0;

    const [messages, totalCount] = await Promise.all([
      //  메시지 목록 조회
      prisma.chatMessage.findMany({
        where: { room_id: roomId },
        take: limit + 1,
        ...(hasCursor
          ? {
              skip: 1,
              cursor: { message_id: cursor },
            }
          : {}),
        orderBy: { message_id: "asc" },
        include: { attachments: true },
      }),
      // 해당 방의 전체 메시지 개수 조회
      prisma.chatMessage.count({
        where: { room_id: roomId },
      }),
    ]);

    return {
      messages,
      totalCount,
    };
  }

  async blockStatus(myId: number, partnerId: number) {
    const blocks = await prisma.userBlock.findMany({
      where: {
        OR: [
          { blocker_id: myId, blocked_id: partnerId },
          { blocker_id: partnerId, blocked_id: myId },
        ],
      },
    });

    return {
      iBlockedPartner: blocks.some((b) => b.blocker_id === myId),
      partnerBlockedMe: blocks.some((b) => b.blocker_id === partnerId),
    };
  }

  // == 채팅방 목록 조회
  async findRoomListByUserId(
    userId: number,
    options: {
      cursor?: number;
      limit: number;
      filter: ChatFilterType;
      search?: string;
    }
  ) {
    const { cursor, limit, filter, search } = options;

    const where: Prisma.ChatParticipantWhereInput = {
      user_id: userId,
      left_at: null, // 나가지 않은 방
    };

    if (filter === "pinned") {
      where.is_pinned = true;
    }

    else if (filter === "unread") {
      where.unread_count = { gt: 0 };
    }

    if (search && search.trim().length > 0) {
      where.chatRoom = {
        participants: {
          some: {
            user_id: { not: userId },
            user: {
              nickname: {
                contains: search.trim(),
              },
            },
          },
        },
      };
    }

    const hasCursor = cursor !== undefined && cursor !== null && cursor !== 0;

    const [rooms, totalRoom] = await Promise.all([
      prisma.chatParticipant.findMany({
        where,

        include: {
          chatRoom: {
            include: {
              lastMessage: {
                include: {
                  attachments: true,
                },
              },
              participants: {
                include: {
                  user: true,
                },
              },
            },
          },
          lastReadMessage: true,
        },

        orderBy: {
          chatRoom: {
            last_message_id: "desc", //  마지막 메세지 최신 순 
          },
        },

        take: limit + 1,

        ...(hasCursor
          ? {
              skip: 1,
              cursor: {
                room_id_user_id: {
                  room_id: cursor,
                  user_id: userId,
                },
              },
            }
          : {}),
      }),
      prisma.chatParticipant.count({ where })
    ]);
    return {rooms, totalRoom}
  };
}


