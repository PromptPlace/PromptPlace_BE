import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithRequest, VerifiedCallback } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

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

export const authenticateJwt = passport.authenticate('jwt', { session: false });
export default passport;