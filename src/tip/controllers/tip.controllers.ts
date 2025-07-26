import { Request, Response } from "express";
import {
  findTipList,
  createTipService,
  patchTipService,
  deleteTipService,
} from "../services/tip.service";

//jwt 인증 적용예정

interface RawPaginationQuery {
  page?: string;
  size?: string;
}

//비회원 이용 가능 - 인증 필요 X
export const getTipList = async (
  req: Request<any, any, any, RawPaginationQuery>,
  res: Response
) => {
  try {
    const result = await findTipList(req.query.page, req.query.size);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "팁 목록 조회 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

// 팁 생성 - 관리자 인증 필요
export const createTip = async (req: Request, res: Response) => {
  try {
    const result = await createTipService(req.body);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "팁 생성 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

export const patchTip = async (req: Request, res: Response) => {
  try {
    const result = await patchTipService(req.params.tipId, req.body);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "팁 수정 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

export const deleteTip = async (req: Request, res: Response) => {
  try {
    const result = await deleteTipService(req.params.tipId);
    return res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err.name || "InternalServerError",
      message: err.message || "팁 삭제 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};
