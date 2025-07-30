import { PrismaClient } from "@prisma/client";
import { AppError } from "../../errors/AppError";
const prisma = new PrismaClient();

export const findAnnouncements = async (page: number, size: number) => {
  const offset = (page - 1) * size;
  return await prisma.announcement.findMany({
    where: { is_visible: true },
    skip: offset,
    take: size,
    orderBy: {
      created_at: "desc",
    },
  });
};

export const createAnnouncementRepository = async (data: any) => {
  return await prisma.announcement.create({
    data: {
      writer_id: data.writer_id,
      title: data.title,
      content: data.content,
      is_visible: true,
      file_url: data.file_url || null,
    },
  });
};

export const updateAnnouncementRepository = async (announcementId: string, data: any) => {
  const parsedAnnouncementId = parseInt(announcementId, 10);
  return await prisma.announcement.update({
    where: { announcement_id: parsedAnnouncementId },
    data: {
      title: data.title,
      content: data.content,
      file_url: data.file_url || null,
    },
  });
};

export const removeAnnouncementRepository = async (announcementId: string) => {
  const parsedAnnouncementId = parseInt(announcementId, 10);

  const announcement = await prisma.announcement.findUnique({
    where: { announcement_id: parsedAnnouncementId },
  });

  if (!announcement) {
    throw new AppError("해당 공지사항이 존재하지 않습니다.", 404, "NotFound");
  }

  if (!announcement.is_visible) {
    throw new AppError("이미 삭제된 공지사항입니다.", 400, "AlreadyDeleted");
  }

  return await prisma.announcement.update({
    where: { announcement_id: parsedAnnouncementId },
    data: {
      is_visible: false,
    },
  });
};