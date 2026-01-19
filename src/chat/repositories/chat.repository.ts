import { PrismaClient } from "@prisma/client";

export class ChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findChatRoomByParticipants(
    userId1: number,
    userId2: number
  ) {
    return this.prisma.chatRoom.findFirst({
      where: {
        user_id1: userId1,
        user_id2: userId2,
      },
    });
  }

  async createChatRoom(
    userId1: number,
    userId2: number
  ) {
    return this.prisma.chatRoom.create({
      data: {
        user_id1: userId1,
        user_id2: userId2,
        last_message_id: null,
      },
    });
  }

	// 채팅방 기본 정보 및 참여자 정보 조회
	async findRoomDetailWithParticipant(roomId: number) {
    return this.prisma.chatRoom.findUnique({
      where: { room_id: roomId },
      include: {
        user1: true, 
        user2: true,
				participants: true,
      },
    });
  }

	// 메시지 및 첨부파일 조회 (Paging 처리)
	async findMessagesByRoomId(room_id: number, cursor?: number, limit: number = 20) {
		return this.prisma.chatMessage.findMany({
			where: { 
				room_id: room_id,
			},
			take: limit + 1, 
			
			...(cursor && {
				skip: 1,
				cursor: { message_id : cursor }, 
			}),

			orderBy: { 
				message_id: 'asc' 
			},
			include: {
				attachments: true,
			},
		});
	}

	async blockStatus(myId: number, partnerId: number) {
		const blocks = await this.prisma.userBlock.findMany({
			where: {
				OR: [
					{blocker_id: myId, blocked_id: partnerId}, // 내가 상대를 차단
					{blocker_id: partnerId, blocked_id: myId} // 상대가 나를 차단
				],			
			},
		});
		
		return {
			iBlockedPartner: blocks.some(b => b.blocker_id === myId),
			partnerBlockedMe: blocks.some(b => b.blocker_id === partnerId),
		};
	};
}

