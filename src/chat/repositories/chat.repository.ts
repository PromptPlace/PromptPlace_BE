import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findChatRoomByParticipants = async (
    user_id1: number, user_id2: number
) => {
    const existChatRoom = await prisma.chatRoom.findFirst({
        where: { 
            user_id1 : user_id1, 
            user_id2: user_id2 
        },
    });
    return existChatRoom;
}

export const createChatRoom = async (
    user_id1: number, user_id2: number
) => {  
    const newChatRoom = await prisma.chatRoom.create({
        data: {
            user_id1 : user_id1, 
            user_id2: user_id2,
            last_message_id: null,
        },
    });
    return newChatRoom;
}

