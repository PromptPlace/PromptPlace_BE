import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const signinRepository = {
    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                user_id: true,
                email: true,
                password: true,
                status: true,
                role: true,
                nickname: true,
                is_initial_setup_required: true, 
            },
        });
    },

    async completeInitialSetup(userId: number, nickname: string, intro: string) {
        const description = intro;
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { user_id: userId },
                data: {
                    nickname: nickname,
                    is_initial_setup_required: false, 
                },
            });

            await tx.userIntro.upsert({
                where: { user_id: userId },
                update: { description: description }, 
                create: { user_id: userId, description: description }, 
            });

            return user;
        });
    },
};