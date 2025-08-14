import passport from "passport";
import { Strategy as NaverStrategy, Profile } from "passport-naver-v2";
import prisma from "../prisma";

export function configureNaverStrategy() {
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID!,
        clientSecret: process.env.NAVER_CLIENT_SECRET!,
        callbackURL: process.env.NAVER_CALLBACK_URL!,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: Function
      ) => {
        try {
          const email = profile.email;
          if (!email) {
            return done(new Error("네이버 프로필에 이메일이 없습니다."), false);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // 사용자가 존재하면 정보를 덮어쓰지 않음 (사용자가 직접 수정한 정보 보존)
            // 소셜 로그인은 단순히 인증만 처리
            return done(null, user);
          } else {
            // 사용자가 없으면 새로 생성
            user = await prisma.user.create({
              data: {
                email,
                name: profile.name || "Unknown",
                nickname: profile.nickname || profile.name || "Unknown",
                social_type: "NAVER",
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
