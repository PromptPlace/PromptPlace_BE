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
const auth_service_1 = __importDefault(require("../services/auth.service"));
const AppError_1 = require("../../errors/AppError");
class AuthController {
    googleCallback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user) {
                    throw new AppError_1.AppError('구글 인증에 실패했습니다.', 401, 'Unauthorized');
                }
                if (user.status === false) {
                    throw new AppError_1.AppError('비활성화된 계정입니다.', 403, 'Forbidden');
                }
                const { accessToken, refreshToken } = yield auth_service_1.default.generateTokens(user);
                res.status(200).json({
                    message: '구글 로그인이 완료되었습니다.',
                    data: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            user_id: user.user_id,
                            name: user.name,
                            nickname: user.nickname,
                            email: user.email,
                            social_type: user.social_type,
                            status: user.status ? 'ACTIVE' : 'INACTIVE',
                            role: user.role,
                            created_at: user.created_at,
                            updated_at: user.updated_at,
                        },
                    },
                    statusCode: 200,
                });
            }
            catch (error) {
                if (error instanceof AppError_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.error, // .name -> .error
                        message: error.message,
                        statusCode: error.statusCode,
                    });
                }
                else {
                    res.status(500).json({
                        error: 'InternalServerError',
                        message: '알 수 없는 오류가 발생했습니다.',
                        statusCode: 500,
                    });
                }
            }
        });
    }
    naverCallback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user) {
                    throw new AppError_1.AppError('네이버 인증에 실패했습니다.', 401, 'Unauthorized');
                }
                if (user.status === false) {
                    throw new AppError_1.AppError('비활성화된 계정입니다.', 403, 'Forbidden');
                }
                const { accessToken, refreshToken } = yield auth_service_1.default.generateTokens(user);
                res.status(200).json({
                    message: '네이버 로그인이 완료되었습니다.',
                    data: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            user_id: user.user_id,
                            name: user.name,
                            nickname: user.nickname,
                            email: user.email,
                            social_type: user.social_type,
                            status: user.status ? 'ACTIVE' : 'INACTIVE',
                            role: user.role,
                            created_at: user.created_at,
                            updated_at: user.updated_at,
                        },
                    },
                    statusCode: 200,
                });
            }
            catch (error) {
                if (error instanceof AppError_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.error,
                        message: error.message,
                        statusCode: error.statusCode,
                    });
                }
                else {
                    res.status(500).json({
                        error: 'InternalServerError',
                        message: '알 수 없는 오류가 발생했습니다.',
                        statusCode: 500,
                    });
                }
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // authenticateJwt 미들웨어가 정상적으로 통과하면 req.user에는 사용자 정보가 들어있음
                const user = req.user;
                yield auth_service_1.default.logout(user.user_id);
                res.status(200).json({
                    message: '로그아웃이 완료되었습니다.',
                    statusCode: 200
                });
            }
            catch (error) {
                // 이 부분은 나중에 프로젝트 전역 에러 핸들러로 위임하는 것이 좋음
                res.status(500).json({
                    error: 'InternalServerError',
                    message: '알 수 없는 오류가 발생했습니다.',
                    statusCode: 500,
                });
            }
        });
    }
}
exports.default = new AuthController();
