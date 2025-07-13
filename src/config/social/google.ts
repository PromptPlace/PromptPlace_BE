import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const configureGoogleStrategy = () => {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(new Error('Google 계정에서 이메일을 가져올 수 없습니다.'), false);
          }

          let user = await prisma.user.findFirst({
            where: {
              email: email,
              social_type: 'google',
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: email,
                name: name || 'Unknown',
                nickname: name || 'Unknown',
                social_type: 'google',
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