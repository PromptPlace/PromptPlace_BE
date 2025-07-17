import { Request, Response } from 'express';
import { findReviewsByPromptId } from '../services/review.service';

interface RawPromptParams {
    promptId: string;
}

interface RawPaginationQuery {
    cursor?: string;
    limit?: string;
}

export const getReviewsByPromptId = async (
    req: Request<RawPromptParams, any, any, RawPaginationQuery>,
    res: Response
) => {
    try {
        const response = await findReviewsByPromptId(
            req.params.promptId,
            req.query.cursor,
            req.query.limit
        );
        return res.success(response);
    } catch (err: any) {
        console.error(err);
        return res.fail({
            error: err.name || "InternalServerError",
            message: err.message || "리뷰 목록 조회 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500
        });
    }
};
