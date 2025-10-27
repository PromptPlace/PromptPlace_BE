import passport from "passport";
import { Strategy as NaverStrategy, Profile } from "passport-naver-v2";
import bcrypt from 'bcrypt';
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
            return done(null, user);
          } else {
            // 1. 안전한 임시 비밀번호 생성
            const tempPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            // 2. 임시 비밀번호를 해시 처리
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            user = await prisma.user.create({
              data: {
                email,
                name: profile.name || "Unknown",
                nickname: profile.name || "Unknown",
                social_type: "NAVER",
                status: true,
                role: "USER",
                password: hashedPassword,
              },
            });
            return done(null, user);
          }
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}
