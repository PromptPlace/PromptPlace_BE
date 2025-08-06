import AuthRepository from "../repositories/auth.repository";
import jwt from "jsonwebtoken";
import { CompleteSignupDto } from "../dtos/complete-signup.dto";
import prisma from "../../config/prisma";

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
        expiresIn: "3h",
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

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { email: completeSignupDto.email },
      data: {
        name: completeSignupDto.name,
        nickname: completeSignupDto.nickname,
      },
    });

    // 추가 정보가 있으면 저장
    if (completeSignupDto.description) {
      await prisma.userIntro.upsert({
        where: { user_id: user.user_id },
        update: { description: completeSignupDto.description },
        create: {
          user_id: user.user_id,
          description: completeSignupDto.description,
        },
      });
    }

    if (completeSignupDto.sns_url) {
      await prisma.userSNS.create({
        data: {
          user_id: user.user_id,
          url: completeSignupDto.sns_url,
          description: "SNS 링크",
        },
      });
    }

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
}

export default new AuthService();
