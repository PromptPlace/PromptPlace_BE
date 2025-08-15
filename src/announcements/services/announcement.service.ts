import { Announcement } from "@prisma/client";
import { mapToAnnouncementListDTO, mapToCreateAnnouncementDTO } from "../dtos/announcement.dto";
import {
  findAnnouncements,
  getAnnouncementRepository,
  createAnnouncementRepository,
  updateAnnouncementRepository,
  removeAnnouncementRepository,
} from "../repositories/announcement.repository";
import eventBus from '../../config/eventBus';
export const findAnnouncementList = async (rawPage?: string, rawSize?: string) => {
  const page = rawPage ? parseInt(rawPage, 10) : 1;
  const size = rawSize ? parseInt(rawSize, 10) : 10;

  if (isNaN(page) || page < 1) throw new Error("page값이 적절하지 않습니다");
  if (isNaN(size) || size < 1) throw new Error("size값이 적절하지 않습니다");

  const rawAnnouncements: Announcement[] = await findAnnouncements(page, size);
  const totalCount = rawAnnouncements.length;

  return mapToAnnouncementListDTO(rawAnnouncements, page, size, totalCount);
};

export const getAnnouncementService = async (announcementId: string) => {
  if (!announcementId) {
    throw new Error("announcementId가 누락되었습니다.");
  }
  const result = await getAnnouncementRepository(announcementId);
  if (!result) {
  throw new Error("Tip not found");
  }
  return mapToCreateAnnouncementDTO(result);
};


export const createAnnouncementService = async (data: any) => {
  if (!data.writer_id) {
    throw new Error("writer_id가 누락되었습니다.");
  }
  if (!data.title || !data.content) {
    throw new Error("title과 content는 필수입니다.");
  }
  const result = await createAnnouncementRepository(data);
  // 공지 생성 후 알림 생성 이벤트 호출
  eventBus.emit('announcement.created', result.announcement_id);

  return mapToCreateAnnouncementDTO(result);
};

export const patchAnnouncementService = async (announcementId: string, data: any) => {
  if (!announcementId) {
    throw new Error("announcementId가 누락되었습니다.");
  }
  if (!data.title && !data.content) {
    throw new Error("수정될 title과 content가 필요합니다.");
  }
  const result = await updateAnnouncementRepository(announcementId, data);
  return mapToCreateAnnouncementDTO(result);
};

export const deleteAnnouncementService = async (announcementId: string) => {
  if (!announcementId) {
    throw new Error("announcementId가 누락되었습니다.");
  }
  await removeAnnouncementRepository(announcementId);
  return { message: "삭제되었습니다." };
};
