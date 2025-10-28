import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import prisma from "../prisma";

export function configureGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: Function
      ) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
            return done(new Error("구글 프로필에 이메일이 없습니다."), false);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            return done(null, user);
          } else {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                nickname: profile.displayName,
                social_type: "GOOGLE",
                status: true,
                role: "USER",
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
