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
const auth_repository_1 = __importDefault(require("../repositories/auth.repository"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../config/prisma"));
class AuthService {
    generateTokens(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = jsonwebtoken_1.default.sign({ id: user.user_id }, process.env.JWT_SECRET, {
                expiresIn: "3h",
            });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.user_id }, process.env.JWT_SECRET, {
                expiresIn: "14d",
            });
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 14);
            yield auth_repository_1.default.saveRefreshToken(refreshToken, user.user_id, expiresAt);
            return { accessToken, refreshToken };
        });
    }
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield auth_repository_1.default.deleteRefreshTokensByUserId(userId);
        });
    }
    completeSignup(completeSignupDto) {
        return __awaiter(this, void 0, void 0, function* () {
            // 임시 사용자 찾기 (소셜 로그인으로 생성된 사용자)
            const user = yield prisma_1.default.user.findUnique({
                where: { email: completeSignupDto.email },
            });
            if (!user) {
                throw new Error("사용자를 찾을 수 없습니다.");
            }
            // 사용자 정보 업데이트
            const updatedUser = yield prisma_1.default.user.update({
                where: { email: completeSignupDto.email },
                data: {
                    name: completeSignupDto.name,
                    nickname: completeSignupDto.nickname,
                },
            });
            // 추가 정보가 있으면 저장
            if (completeSignupDto.description) {
                yield prisma_1.default.userIntro.upsert({
                    where: { user_id: user.user_id },
                    update: { description: completeSignupDto.description },
                    create: {
                        user_id: user.user_id,
                        description: completeSignupDto.description,
                    },
                });
            }
            if (completeSignupDto.sns_url) {
                yield prisma_1.default.userSNS.create({
                    data: {
                        user_id: user.user_id,
                        url: completeSignupDto.sns_url,
                        description: "SNS 링크",
                    },
                });
            }
            // 토큰 생성
            const { accessToken, refreshToken } = yield this.generateTokens(updatedUser);
            return {
                accessToken,
                refreshToken,
                user: {
                    user_id: updatedUser.user_id,
                    name: updatedUser.name,
                    nickname: updatedUser.nickname,
                    email: updatedUser.email,
                    social_type: updatedUser.social_type,
                    status: updatedUser.status ? "ACTIVE" : "INACTIVE",
                    role: updatedUser.role,
                    created_at: updatedUser.created_at,
                    updated_at: updatedUser.updated_at,
                },
            };
        });
    }
}
exports.default = new AuthService();
