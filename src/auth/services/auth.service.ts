import AuthRepository from "../repositories/auth.repository";
import jwt from "jsonwebtoken";
import { CompleteSignupDto } from "../dtos/complete-signup.dto";
import prisma from "../../config/prisma";
import { AppError } from "../../errors/AppError";
import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as NaverStrategy } from "passport-naver-v2";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async generateTokens(user: any): Promise<Tokens> {
    const accessToken = jwt.sign(
      { id: user.user_id },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.user_id },
      process.env.JWT_SECRET!,
      {
        expiresIn: "14d",
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await AuthRepository.saveRefreshToken(
      refreshToken,
      user.user_id,
      expiresAt
    );

    return { accessToken, refreshToken };
  }

  async logout(userId: number): Promise<void> {
    await AuthRepository.deleteRefreshTokensByUserId(userId);
  }

  async completeSignup(completeSignupDto: CompleteSignupDto): Promise<any> {
    // 임시 사용자 찾기 (소셜 로그인으로 생성된 사용자)
    const user = await prisma.user.findUnique({
      where: { email: completeSignupDto.email },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 사용자 정보 업데이트 (name, nickname만)
    const updatedUser = await prisma.user.update({
      where: { email: completeSignupDto.email },
      data: {
        name: completeSignupDto.name,
        nickname: completeSignupDto.nickname,
      },
    });

    // 토큰 생성
    const { accessToken, refreshToken } = await this.generateTokens(
      updatedUser
    );

    return {
      accessToken,
      refreshToken,
      user: {
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        social_type: updatedUser.social_type,
        status: updatedUser.status ? "ACTIVE" : "INACTIVE",
        role: updatedUser.role,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    };
  }

  async exchangeKakaoToken(code: string) {
    try {
      // 기존 Passport 카카오 전략을 활용하여 사용자 정보 처리
      const user = await this.handleKakaoUserFromCode(code);

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          social_type: user.social_type,
          status: user.status,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      };
    } catch (error) {
      throw new AppError("카카오 인증에 실패했습니다.", 401);
    }
  }

  async exchangeGoogleToken(code: string) {
    try {
      // 기존 Passport 구글 전략을 활용하여 사용자 정보 처리
      const user = await this.handleGoogleUserFromCode(code);

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          social_type: user.social_type,
          status: user.status,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      };
    } catch (error) {
      throw new AppError("구글 인증에 실패했습니다.", 401);
    }
  }

  async exchangeNaverToken(code: string) {
    try {
      // 기존 Passport 네이버 전략을 활용하여 사용자 정보 처리
      const user = await this.handleNaverUserFromCode(code);

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          social_type: user.social_type,
          status: user.status,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      };
    } catch (error) {
      throw new AppError("네이버 인증에 실패했습니다.", 401);
    }
  }

  // 카카오 인증코드로 사용자 처리 (기존 로직 재사용)
  private async handleKakaoUserFromCode(code: string): Promise<any> {
    try {
      // 카카오에서 액세스 토큰 받기
      const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_CLIENT_ID!,
          client_secret: process.env.KAKAO_CLIENT_SECRET!,
          code: code,
          redirect_uri: process.env.KAKAO_CALLBACK_URL!,
        }),
      });

      if (!tokenResponse.ok) {
        throw new AppError("카카오 액세스 토큰을 받을 수 없습니다.", 401);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 카카오에서 사용자 정보 받기
      const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        throw new AppError("카카오 사용자 정보를 받을 수 없습니다.", 401);
      }

      const kakaoUser = await userResponse.json();

      // 기존 로직과 동일하게 사용자 처리
      const email = kakaoUser.kakao_account?.email;
      if (!email) {
        throw new AppError("카카오 프로필에 이메일이 없습니다.", 400);
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        user = await prisma.user.update({
          where: { email },
          data: {
            name: kakaoUser.properties?.nickname || user.name,
            nickname: kakaoUser.properties?.nickname || user.nickname,
            updated_at: new Date(),
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name: "", // 빈 문자열로 설정 (Prisma 스키마 요구사항 충족)
            nickname: kakaoUser.properties?.nickname || "카카오 사용자",
            social_type: "KAKAO",
            status: true,
            role: "USER",
          },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("카카오 사용자 처리에 실패했습니다.", 500);
    }
  }

  // 구글 인증코드로 사용자 처리 (기존 로직 재사용)
  private async handleGoogleUserFromCode(code: string): Promise<any> {
    try {
      // 구글에서 액세스 토큰 받기
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
        }),
      });

      if (!tokenResponse.ok) {
        throw new AppError("구글 액세스 토큰을 받을 수 없습니다.", 401);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 구글에서 사용자 정보 받기
      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!userResponse.ok) {
        throw new AppError("구글 사용자 정보를 받을 수 없습니다.", 401);
      }

      const googleUser = await userResponse.json();

      // 기존 로직과 동일하게 사용자 처리
      const email = googleUser.email;
      if (!email) {
        throw new AppError("구글 프로필에 이메일이 없습니다.", 400);
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        user = await prisma.user.update({
          where: { email },
          data: {
            name: googleUser.name || user.name,
            nickname: googleUser.name || user.nickname,
            updated_at: new Date(),
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name: googleUser.name || "구글 사용자",
            nickname: googleUser.name || "구글 사용자",
            social_type: "GOOGLE",
            status: true,
            role: "USER",
          },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("구글 사용자 처리에 실패했습니다.", 500);
    }
  }

  // 네이버 인증코드로 사용자 처리 (기존 로직 재사용)
  private async handleNaverUserFromCode(code: string): Promise<any> {
    try {
      // 네이버에서 액세스 토큰 받기
      const tokenResponse = await fetch(
        "https://nid.naver.com/oauth2.0/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.NAVER_CLIENT_ID!,
            client_secret: process.env.NAVER_CLIENT_SECRET!,
            code: code,
            redirect_uri: process.env.NAVER_CALLBACK_URL!,
          }),
        }
      );

      if (!tokenResponse.ok) {
        throw new AppError("네이버 액세스 토큰을 받을 수 없습니다.", 401);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 네이버에서 사용자 정보 받기
      const userResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        throw new AppError("네이버 사용자 정보를 받을 수 없습니다.", 401);
      }

      const naverUserData = await userResponse.json();
      const naverUser = naverUserData.response;

      // 기존 로직과 동일하게 사용자 처리
      const email = naverUser.email;
      if (!email) {
        throw new AppError("네이버 프로필에 이메일이 없습니다.", 400);
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        user = await prisma.user.update({
          where: { email },
          data: {
            name: naverUser.name || user.name,
            nickname: naverUser.nickname || user.nickname || user.name,
            updated_at: new Date(),
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name: naverUser.name || "네이버 사용자",
            nickname: naverUser.nickname || naverUser.name || "네이버 사용자",
            social_type: "NAVER",
            status: true,
            role: "USER",
          },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("네이버 사용자 처리에 실패했습니다.", 500);
    }
  }
}

export default new AuthService();
