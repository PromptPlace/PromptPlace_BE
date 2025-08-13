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
exports.configureKakaoStrategy = configureKakaoStrategy;
const passport_1 = __importDefault(require("passport"));
const passport_kakao_1 = require("passport-kakao");
const prisma_1 = __importDefault(require("../prisma"));
function configureKakaoStrategy() {
    // 환경 변수 값 로그 찍기
    console.log('KAKAO_CLIENT_ID:', process.env.KAKAO_CLIENT_ID);
    console.log('KAKAO_CLIENT_SECRET:', process.env.KAKAO_CLIENT_SECRET);
    console.log('KAKAO_CALLBACK_URL:', process.env.KAKAO_CALLBACK_URL);
    passport_1.default.use(new passport_kakao_1.Strategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: process.env.KAKAO_CALLBACK_URL,
    }, (accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const email = (_b = (_a = profile._json) === null || _a === void 0 ? void 0 : _a.kakao_account) === null || _b === void 0 ? void 0 : _b.email;
            const nickname = (_d = (_c = profile._json) === null || _c === void 0 ? void 0 : _c.properties) === null || _d === void 0 ? void 0 : _d.nickname;
            if (!email) {
                return done(new Error("카카오 프로필에 이메일이 없습니다."), false);
            }
            let user = yield prisma_1.default.user.findUnique({
                where: { email },
            });
            if (user) {
                // 사용자가 존재하면 이름과 닉네임만 업데이트
                user = yield prisma_1.default.user.update({
                    where: { email },
                    data: {
                        name: nickname || profile.displayName,
                        nickname: nickname || profile.displayName,
                    },
                });
            }
            else {
                // 사용자가 없으면 새로 생성
                user = yield prisma_1.default.user.create({
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
        }
        catch (error) {
            return done(error, false);
        }
    })));
}
