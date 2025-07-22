import { Request, Response } from 'express';
import { findTipList } from '../services/tip.service';

//jwt 인증 적용예정

interface RawPaginationQuery {
  page?: string;
  size?: string;
}

//비회원 이용 가능 - 인증 필요 X
export const getTipList = async (
    req: Request<any,any,any,RawPaginationQuery>, 
    res: Response
) => {
  try {
    const result = await findTipList(
        req.query.page,
        req.query.size
    );
    return res.success({
      data: result,
    });
  } catch (err: any) {  
    console.error(err);
    return res.status(500).json({
      error: err.name || 'InternalServerError',
      message: err.message || '팁 목록 조회 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500
    });
  }
}