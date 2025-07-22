import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findtips = async (page: number, size: number) => {
  const offset = (page - 1) * size;
  return await prisma.tip.findMany({
    skip: offset,
    take: size,
    orderBy: {
      created_at: 'desc'
    }
  });
}