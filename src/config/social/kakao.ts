import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import prisma from "../prisma";
import dotenv from 'dotenv';
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
            // 사용자가 존재하면 이름과 닉네임만 업데이트
            user = await prisma.user.update({
              where: { email },
              data: {
                name: nickname || profile.displayName,
                nickname: nickname || profile.displayName,
              },
            });
          } else {
            // 사용자가 없으면 새로 생성
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
