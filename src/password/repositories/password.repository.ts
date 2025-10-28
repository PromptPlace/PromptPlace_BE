// src/auth/repositories/user.repository.ts (예시)

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const passwordRepository = {
    async findUserByEmail(email: string) {
        return prisma.user.findUnique({ 
            where: { email },
            select: { 
                user_id: true, 
                password: true,
                email: true, 
                status: true,
            }
        });
    },

    async updatePassword(userId: number, newHashedPassword: string) {
        // 기존 비밀번호를 새로운 비밀번호로 덮어쓰므로, 이전 비밀번호는 자동 삭제(변경)됨
        return prisma.user.update({
            where: { user_id: userId },
            data: {
                password: newHashedPassword,
                updated_at: new Date(),
            },
        });
    },
};