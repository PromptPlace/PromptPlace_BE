import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import prisma from "../prisma";
import dotenv from "dotenv";
dotenv.config();

export function configureKakaoStrategy() {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID!,
        clientSecret: process.env.KAKAO_CLIENT_SECRET!,
        callbackURL: process.env.KAKAO_CALLBACK_URL!,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: Function
      ) => {
        try {
          const email = profile._json?.kakao_account?.email;
          const nickname = profile._json?.properties?.nickname;

          if (!email) {
            return done(new Error("카카오 프로필에 이메일이 없습니다."), false);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // 사용자가 존재하면 정보를 덮어쓰지 않음 (사용자가 직접 수정한 정보 보존)
            // 소셜 로그인은 단순히 인증만 처리
            return done(null, user);
          } else {
            user = await prisma.user.create({
              data: {
                email,
                name: nickname || profile.displayName,
                nickname: nickname || profile.displayName,
                social_type: "KAKAO",
                status: true,
                role: "USER",
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}
