import { Request, Response, NextFunction } from "express";
import { MemberService } from "../services/member.service";
import { MemberRepository } from "../repositories/member.repository";
import { UpdateMemberDto } from "../dtos/update-member.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AppError } from "../../errors/AppError";
import { CreateIntroDto } from "../dtos/create-intro.dto";
import { UpdateIntroDto } from "../dtos/update-intro.dto";
import { CreateHistoryDto } from "../dtos/create-history.dto";
import { UpdateHistoryDto } from "../dtos/update-history.dto";

export class MemberController {
  private memberService: MemberService;

  constructor() {
    this.memberService = new MemberService(new MemberRepository());
  }

  public async getFollowers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const memberId = parseInt(req.params.memberId, 10);
      const followers = await this.memberService.getFollowers(memberId);
      res.status(200).json({
        message: "팔로워 목록 조회 완료",
        data: followers,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async followUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const followerId = (req.user as any).user_id;
      const followingId = parseInt(req.params.memberId, 10);
      await this.memberService.followUser(followerId, followingId);
      res.status(201).json({ message: "팔로우 성공" });
    } catch (error) {
      next(error);
    }
  }

  public async unfollowUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const followerId = (req.user as any).user_id;
      const followingId = parseInt(req.params.memberId, 10);
      await this.memberService.unfollowUser(followerId, followingId);
      res.status(200).json({ message: "언팔로우 성공" });
    } catch (error) {
      next(error);
    }
  }

  public async getFollowings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const memberId = parseInt(req.params.memberId, 10);
      const followings = await this.memberService.getFollowings(memberId);
      res.status(200).json({
        message: "팔로잉 목록 조회 완료",
        data: followings,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMemberPrompts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { memberId } = req.params;
      const { cursor, limit } = req.query;

      // memberId 검증
      const memberIdNum = parseInt(memberId, 10);

      // 쿼리 파라미터 검증
      const cursorNum = cursor ? parseInt(cursor as string, 10) : undefined;
      const limitNum = limit ? parseInt(limit as string, 10) : 10; // 기본값 10

      if (limit && (isNaN(limitNum) || limitNum <= 0 || limitNum > 50)) {
        res.status(400).json({
          error: "BadRequest",
          message: "limit은 1-50 사이의 숫자여야 합니다.",
          statusCode: 400,
        });
        return;
      }

      const result = await this.memberService.getMemberPrompts(
        memberIdNum,
        cursorNum,
        limitNum
      );

      res.status(200).json({
        message: "회원 프롬프트 목록 조회 완료",
        data: {
          prompts: result.prompts,
          pagination: {
            nextCursor: result.nextCursor,
            has_more: result.has_more,
            limit: limitNum,
          },
        },
        statusCode: 200,
      });
    } catch (error) {
      // 에러 예외 처리
      if (error instanceof Error) {
        res.status(500).json({
          error: "InternalServerError",
          message: error.message,
          statusCode: 500,
        });
      } else {
        res.status(500).json({
          error: "InternalServerError",
          message: "알 수 없는 오류가 발생했습니다.",
          statusCode: 500,
        });
      }
    }
  }

  public async getMemberById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requesterId = (req.user as any).user_id;
      const memberId = parseInt(req.params.memberId, 10);

      const member = await this.memberService.getMemberById(
        requesterId,
        memberId
      );

      res.status(200).json({
        message: "회원 정보 조회 완료",
        data: member,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any).user_id;
      const updateMemberDto = plainToInstance(UpdateMemberDto, req.body);

      const errors = await validate(updateMemberDto);
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(", ");
        throw new AppError("BadRequest", message, 400);
      }

      const updatedUser = await this.memberService.updateMember(
        userId,
        updateMemberDto
      );

      res.status(200).json({
        message: "회원 정보 수정 완료",
        user: updatedUser,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async createOrUpdateIntro(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any).user_id;
      const createIntroDto = plainToInstance(CreateIntroDto, req.body);

      const errors = await validate(createIntroDto);
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(", ");
        throw new AppError("BadRequest", message, 400);
      }

      const result = await this.memberService.createOrUpdateIntro(
        userId,
        createIntroDto
      );

      res.status(200).json({
        message: "한줄 소개가 성공적으로 작성되었습니다.",
        intro: result.description,
        updated_at: result.updated_at,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateIntro(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any).user_id;
      const updateIntroDto = plainToInstance(UpdateIntroDto, req.body);

      const errors = await validate(updateIntroDto);
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(", ");
        throw new AppError("BadRequest", message, 400);
      }

      const result = await this.memberService.updateIntro(
        userId,
        updateIntroDto
      );

      res.status(200).json({
        message: "한줄 소개가 성공적으로 수정되었습니다.",
        intro: result.description,
        updated_at: result.updated_at,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async createHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any).user_id;
      const createHistoryDto = plainToInstance(CreateHistoryDto, req.body);

      const errors = await validate(createHistoryDto);
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(", ");
        throw new AppError("BadRequest", message, 400);
      }

      const newHistory = await this.memberService.createHistory(
        userId,
        createHistoryDto
      );

      res.status(201).json({
        message: "이력이 성공적으로 작성되었습니다.",
        history: {
          history_id: newHistory.history_id,
          history: newHistory.history,
        },
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any).user_id;
      const historyId = parseInt(req.params.historyId, 10);
      const updateHistoryDto = plainToInstance(UpdateHistoryDto, req.body);

      const errors = await validate(updateHistoryDto);
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(", ");
        throw new AppError("BadRequest", message, 400);
      }

      const updatedHistory = await this.memberService.updateHistory(
        userId,
        historyId,
        updateHistoryDto
      );

      res.status(200).json({
        message: "이력이 성공적으로 수정되었습니다.",
        history_id: updatedHistory.history_id,
        history: updatedHistory.history,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any).user_id;
      const historyId = parseInt(req.params.historyId, 10);

      await this.memberService.deleteHistory(userId, historyId);

      res.status(200).json({
        message: "이력이 성공적으로 삭제되었습니다.",
        history_id: historyId,
        deleted_at: new Date(),
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
}
