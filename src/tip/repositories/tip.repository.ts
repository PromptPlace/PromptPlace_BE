import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findtips = async (page: number, size: number) => {
  const offset = (page - 1) * size;
  return await prisma.tip.findMany({
    where: { is_visible: true },
    skip: offset,
    take: size,
    orderBy: {
      created_at: "desc",
    },
  });
};

export const createTipRepository = async (data: any) => {
  return await prisma.tip.create({
    data: {
      writer_id: data.writer_id,
      title: data.title,
      content: data.content,
      is_visible: true,
    },
  });
};

export const updateTipRepository = async (tipId: string, data: any) => {
  const parsedTipId = parseInt(tipId, 10);
  return await prisma.tip.update({
    where: { tip_id: parsedTipId },
    data: {
      title: data.title,
      content: data.content,
    },
  });
};

export const removeTipRepository = async (tipId: string) => {
  const parsedTipId = parseInt(tipId, 10);
  return await prisma.tip.update({
    where: { tip_id: parsedTipId },
    data: {
      is_visible: false,
    },
  });
};
