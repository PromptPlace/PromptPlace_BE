import { Tip } from "@prisma/client";
import { mapToTipListDTO, mapToCreateTipDTO } from "../dtos/tip.dto";
import {
  findtips,
  getTipRepository,
  createTipRepository,
  updateTipRepository,
  removeTipRepository,
} from "../repositories/tip.repository";

export const findTipList = async (rawPage?: string, rawSize?: string) => {
  const page = rawPage ? parseInt(rawPage, 10) : 1;
  const size = rawSize ? parseInt(rawSize, 10) : 10;

  if (isNaN(page) || page < 1) throw new Error("page값이 적절하지 않습니다");
  if (isNaN(size) || size < 1) throw new Error("size값이 적절하지 않습니다");

  const rawTips: Tip[] = await findtips(page, size);
  const totalCount = rawTips.length;

  return mapToTipListDTO(rawTips, page, size, totalCount);
};

export const getTipService = async (tipId: string) => {
  if (!tipId) {
    throw new Error("tipId가 누락되었습니다.");
  }
  const result = await getTipRepository(tipId);
  
  if (!result) {
  throw new Error("Tip not found");
  }
  return mapToCreateTipDTO(result);
};

export const createTipService = async (data: any) => {
  if (!data.writer_id) {
    throw new Error("writer_id가 누락되었습니다.");
  }
  if (!data.title || !data.content) {
    throw new Error("title과 content는 필수입니다.");
  }
  const result = await createTipRepository(data);
  return mapToCreateTipDTO(result);
};

export const patchTipService = async (tipId: string, data: any) => {
  if (!tipId) {
    throw new Error("tipId가 누락되었습니다.");
  }
  if (!data.title && !data.content) {
    throw new Error("수정될 title과 content가 필요합니다.");
  }
  const result = await updateTipRepository(tipId, data);
  return mapToCreateTipDTO(result);
};

export const deleteTipService = async (tipId: string) => {
  if (!tipId) {
    throw new Error("tipId가 누락되었습니다.");
  }
  await removeTipRepository(tipId);
  return { message: "삭제되었습니다." };
};
