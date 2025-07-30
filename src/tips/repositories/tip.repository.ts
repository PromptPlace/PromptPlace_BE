import { PrismaClient } from "@prisma/client";
import { AppError } from "../../errors/AppError";
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

  const tip = await prisma.tip.findUnique({
    where: { tip_id: parsedTipId },
  });

  if (!tip) {
    throw new AppError("해당 팁이 존재하지 않습니다.", 404, "NotFound");
  }

  if (!tip.is_visible) {
    throw new AppError("이미 삭제된 팁입니다.", 400, "AlreadyDeleted");
  }

  return await prisma.tip.update({
    where: { tip_id: parsedTipId },
    data: {
      is_visible: false,
    },
  });
};
