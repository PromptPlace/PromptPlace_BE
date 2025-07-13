import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const configureNaverStrategy = () => {
  passport.use(
    'naver',
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID!,
        clientSecret: process.env.NAVER_CLIENT_SECRET!,
        callbackURL: process.env.NAVER_CALLBACK_URL!,
      },
      async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        try {
          const email = profile.email;
          const name = profile.name;

          if (!email) {
            return done(new Error('네이버 계정에서 이메일을 가져올 수 없습니다.'), false);
          }

          let user = await prisma.user.findFirst({
            where: {
              email: email,
              social_type: 'naver',
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: email,
                name: name || 'Unknown',
                nickname: name || 'Unknown',
                social_type: 'naver',
                status: true,
                role: 'USER',
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );
}; 