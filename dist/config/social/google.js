"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGoogleStrategy = configureGoogleStrategy;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = __importDefault(require("../prisma"));
function configureGoogleStrategy() {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, (accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
            if (!email) {
                return done(new Error('구글 프로필에 이메일이 없습니다.'), false);
            }
            let user = yield prisma_1.default.user.findUnique({
                where: { email },
            });
            if (user) {
                // 사용자가 존재하면 이름만 업데이트
                user = yield prisma_1.default.user.update({
                    where: { email },
                    data: { name: profile.displayName },
                });
            }
            else {
                // 사용자가 없으면 새로 생성
                user = yield prisma_1.default.user.create({
                    data: {
                        email,
                        name: profile.displayName,
                        nickname: profile.displayName,
                        social_type: 'GOOGLE',
                        status: true,
                        role: 'USER',
                    },
                });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    })));
}
