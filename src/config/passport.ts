import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithRequest, VerifiedCallback } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { configureGoogleStrategy } from './social/google';
import { configureNaverStrategy } from './social/naver';

const prisma = new PrismaClient();

// JWT Strategy 설정
const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  passReqToCallback: true,
};

passport.use(
  'jwt',
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

// 소셜 로그인 Strategy 설정
configureGoogleStrategy();
configureNaverStrategy();


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
export const authenticateNaver = passport.authenticate('naver', { authType: 'reprompt' });
export default passport;