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
exports.authenticateKakao = exports.authenticateNaver = exports.authenticateGoogle = exports.authenticateJwt = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const google_1 = require("./social/google");
const naver_1 = require("./social/naver");
const kakao_1 = require("./social/kakao");
const prisma_1 = __importDefault(require("./prisma"));
// JWT Strategy 설정
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
};
passport_1.default.use("jwt", new passport_jwt_1.Strategy(options, (req, jwtPayload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { user_id: jwtPayload.id },
        });
        if (!user)
            return done(null, false);
        req.user = user; // 커스텀으로 req.user 확장 시 타입 정의 필요
        return done(null, user);
    }
    catch (err) {
        return done(err, false);
    }
})));
// 소셜 로그인 Strategy 설정
(0, google_1.configureGoogleStrategy)();
(0, naver_1.configureNaverStrategy)();
(0, kakao_1.configureKakaoStrategy)();
// Passport serialize/deserialize 설정
passport_1.default.serializeUser((user, done) => {
    done(null, user.user_id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { user_id: id },
        });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
}));
exports.authenticateJwt = passport_1.default.authenticate("jwt", { session: false });
exports.authenticateGoogle = passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
});
exports.authenticateNaver = passport_1.default.authenticate("naver", {
    authType: "reprompt",
});
exports.authenticateKakao = passport_1.default.authenticate("kakao");
exports.default = passport_1.default;
