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
class AuthService {
    generateTokens(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = jsonwebtoken_1.default.sign({ id: user.user_id }, process.env.JWT_SECRET, {
                expiresIn: '3h',
            });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.user_id }, process.env.JWT_SECRET, {
                expiresIn: '14d',
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
}
exports.default = new AuthService();
