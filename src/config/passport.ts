import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithRequest, VerifiedCallback } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

// JWT Strategy 설정
const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  passReqToCallback: true,
};

passport.use(
  new JwtStrategy(
    options,
    async (req: Request, jwtPayload: any, done: VerifiedCallback) => {
      try {
        const user = await prisma.user.findUnique({
          where: { user_id: jwtPayload.id },
        });

        if (!user) return done(null, false);

        req.user = user; // 커스텀으로 req.user 확장 시 타입 정의 필요
        return done(null, user);
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

// Google OAuth Strategy 설정
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Google 프로필에서 필요한 정보 추출
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('Google 계정에서 이메일을 가져올 수 없습니다.'), false);
        }

        // 기존 사용자 확인
        let user = await prisma.user.findFirst({
          where: {
            email: email,
            social_type: 'google'
          }
        });

        if (!user) {
          // 새 사용자 생성
          user = await prisma.user.create({
            data: {
              email: email,
              name: name || 'Unknown',
              nickname: name || 'Unknown',
              social_type: 'google',
              status: true,
              role: 'USER'
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);

// Passport serialize/deserialize 설정
passport.serializeUser((user: any, done) => {
  done(null, user.user_id); 
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export const authenticateJwt = passport.authenticate('jwt', { session: false });
export const authenticateGoogle = passport.authenticate('google', { scope: ['profile', 'email'] });
export default passport;