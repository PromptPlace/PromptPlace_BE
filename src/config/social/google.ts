import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import prisma from '../prisma';

export function configureGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/api/auth/login/google/callback', // 변경된 콜백 URL
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: Function) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
            return done(new Error('구글 프로필에 이메일이 없습니다.'), false);
          }

          let user = await prisma.user.findFirst({ where: { email, social_type: 'GOOGLE' } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                nickname: profile.displayName, // 닉네임은 우선 displayName으로 설정
                social_type: 'GOOGLE',
                status: true,
                role: 'USER', // role 필드 추가
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