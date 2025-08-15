import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptionsWithRequest,
  VerifiedCallback,
} from "passport-jwt";
import { Request } from "express";
import { configureGoogleStrategy } from "./social/google";
import { configureNaverStrategy } from "./social/naver";
import { configureKakaoStrategy } from "./social/kakao";
import prisma from "./prisma";

// JWT Strategy 설정
const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  passReqToCallback: true,
};

passport.use(
  "jwt",
  new JwtStrategy(
    options,
    async (req: Request, jwtPayload: any, done: VerifiedCallback) => {
      try {
        const user = await prisma.user.findUnique({
          where: { user_id: jwtPayload.id },
        });

        if (!user || !user.status) {
          // 커스텀 에러 객체로 반환
          const error = new Error("Unauthorized");
          (error as any).statusCode = 401;
          (error as any).error = "Unauthorized";
          (error as any).message = "로그인이 필요합니다.";
          return done(error, false);
        }

        req.user = user;
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
configureKakaoStrategy();

// Passport serialize/deserialize 설정
passport.serializeUser((user: any, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export const authenticateJwt = passport.authenticate("jwt", { session: false });
export const authenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
});
export const authenticateNaver = passport.authenticate("naver", {
  authType: "reprompt",
});
export const authenticateKakao = passport.authenticate("kakao");
export default passport;
