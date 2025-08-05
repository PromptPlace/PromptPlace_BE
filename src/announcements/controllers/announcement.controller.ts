import { Request, Response } from "express";
import {
  findAnnouncementList,
  createAnnouncementService,
  patchAnnouncementService,
  deleteAnnouncementService,
} from "../services/announcement.service";
import eventBus from '../../config/eventBus';

//jwt 인증 적용예정

interface RawPaginationQuery {
  page?: string;
  size?: string;
}

//비회원 이용 가능 
export const getAnnouncementList = async (
  req: Request<any, any, any, RawPaginationQuery>,
  res: Response
) => {
  try {
    const result = await findAnnouncementList(req.query.page, req.query.size);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "공지사항 조회 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: "no user",
      message: "로그인이 필요합니다.",
    });
    return;
  }

  try {
    const result = await createAnnouncementService(req.body);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "공지사항 생성 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

export const patchAnnouncement = async (req: Request, res: Response) => {
  try {
    const result = await patchAnnouncementService(req.params.announcementId, req.body);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "공지사항 수정 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const result = await deleteAnnouncementService(req.params.announcementId);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "공지사항 삭제 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};
