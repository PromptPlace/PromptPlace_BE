import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { AppError } from "../../errors/AppError";
import { CompleteSignupDto } from "../dtos/complete-signup.dto";
import { validate } from "class-validator";
import prisma from "../../config/prisma";
import { isActive } from "../../utils/status";

class AuthController {
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      let user = req.user as any;
      if (!user) {
        throw new AppError("구글 인증에 실패했습니다.", 401, "Unauthorized");
      }

      if (!isActive(user.status)) {
        const inactive = user.inactive_date
          ? new Date(user.inactive_date)
          : null;
        const canReactivate =
          inactive &&
          Date.now() >= inactive.getTime() + 30 * 24 * 60 * 60 * 1000;

        if (!canReactivate) {
          throw new AppError(
            "비활성화된 계정입니다. 30일 후에 다시 시도해주세요.",
            403,
            "Forbidden"
          );
        }

        user = await prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            status: true,
            inactive_date: null,
            updated_at: new Date(),
          },
        });
      }

      const { accessToken, refreshToken } = await AuthService.generateTokens(
        user
      );

      res.status(200).json({
        message: "구글 로그인이 완료되었습니다.",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            user_id: user.user_id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            social_type: user.social_type,
            status: user.status ? "ACTIVE" : "INACTIVE",
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.error, // .name -> .error
          message: error.message,
          statusCode: error.statusCode,
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

  async naverCallback(req: Request, res: Response): Promise<void> {
    try {
      let user = req.user as any;
      if (!user) {
        throw new AppError("네이버 인증에 실패했습니다.", 401, "Unauthorized");
      }

      if (!isActive(user.status)) {
        const inactive = user.inactive_date
          ? new Date(user.inactive_date)
          : null;
        const canReactivate =
          inactive &&
          Date.now() >= inactive.getTime() + 30 * 24 * 60 * 60 * 1000;

        if (!canReactivate) {
          throw new AppError(
            "비활성화된 계정입니다. 30일 후에 다시 시도해주세요.",
            403,
            "Forbidden"
          );
        }

        user = await prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            status: true,
            inactive_date: null,
            updated_at: new Date(),
          },
        });
      }

      const { accessToken, refreshToken } = await AuthService.generateTokens(
        user
      );

      res.status(200).json({
        message: "네이버 로그인이 완료되었습니다.",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            user_id: user.user_id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            social_type: user.social_type,
            status: user.status ? "ACTIVE" : "INACTIVE",
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.error,
          message: error.message,
          statusCode: error.statusCode,
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

  async kakaoCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        throw new AppError("카카오 인증에 실패했습니다.", 401, "Unauthorized");
      }

      if (!isActive(user.status)) {
        throw new AppError("비활성화된 계정입니다.", 403, "Forbidden");
      }

      const { accessToken, refreshToken } = await AuthService.generateTokens(
        user
      );

      res.status(200).json({
        message: "카카오 로그인이 완료되었습니다.",
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            user_id: user.user_id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            social_type: user.social_type,
            status: user.status ? "ACTIVE" : "INACTIVE",
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.error,
          message: error.message,
          statusCode: error.statusCode,
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

  async completeSignup(req: Request, res: Response): Promise<void> {
    try {
      const completeSignupDto = new CompleteSignupDto();
      Object.assign(completeSignupDto, req.body);

      const errors = await validate(completeSignupDto);
      if (errors.length > 0) {
        throw new AppError(
          "입력 데이터가 유효하지 않습니다.",
          400,
          "BadRequest"
        );
      }

      const result = await AuthService.completeSignup(completeSignupDto);

      res.status(200).json({
        message: "회원가입이 완료되었습니다.",
        data: {
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
          user: result.user,
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.error,
          message: error.message,
          statusCode: error.statusCode,
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

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // authenticateJwt 미들웨어가 정상적으로 통과하면 req.user에는 사용자 정보가 들어있음
      const user = req.user as any;

      await AuthService.logout(user.user_id);

      res.status(200).json({
        message: "로그아웃이 완료되었습니다.",
        statusCode: 200,
      });
    } catch (error) {
      // 이 부분은 나중에 프로젝트 전역 에러 핸들러로 위임하는 것이 좋음
      res.status(500).json({
        error: "InternalServerError",
        message: "알 수 없는 오류가 발생했습니다.",
        statusCode: 500,
      });
    }
  }

  async kakaoToken(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          error: "BadRequest",
          message: "인증코드가 필요합니다.",
          statusCode: 400,
        });
      }

      const result = await AuthService.exchangeKakaoToken(code);

      res.status(200).json({
        message: "카카오 로그인이 완료되었습니다.",
        data: result,
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.name,
          message: error.message,
          statusCode: error.statusCode,
        });
      }

      res.status(500).json({
        error: "InternalServerError",
        message: "알 수 없는 오류가 발생했습니다.",
        statusCode: 500,
      });
    }
  }

  async googleToken(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          error: "BadRequest",
          message: "인증코드가 필요합니다.",
          statusCode: 400,
        });
      }

      const result = await AuthService.exchangeGoogleToken(code);

      res.status(200).json({
        message: "구글 로그인이 완료되었습니다.",
        data: result,
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.name,
          message: error.message,
          statusCode: error.statusCode,
        });
      }

      res.status(500).json({
        error: "InternalServerError",
        message: "알 수 없는 오류가 발생했습니다.",
        statusCode: 500,
      });
    }
  }

  async naverToken(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          error: "BadRequest",
          message: "인증코드가 필요합니다.",
          statusCode: 400,
        });
      }

      const result = await AuthService.exchangeNaverToken(code);

      res.status(200).json({
        message: "네이버 로그인이 완료되었습니다.",
        data: result,
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.name,
          message: error.message,
          statusCode: error.statusCode,
        });
      }

      res.status(500).json({
        error: "InternalServerError",
        message: "알 수 없는 오류가 발생했습니다.",
        statusCode: 500,
      });
    }
  }
}

export default new AuthController();
