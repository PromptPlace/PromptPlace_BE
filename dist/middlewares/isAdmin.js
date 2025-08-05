"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    // 1. 로그인 여부 확인
    if (!req.user) {
        return res.status(401).json({
            statusCode: 401,
            error: "Unauthorized",
            message: "로그인이 필요합니다.",
        });
    }
    // 2. 관리자 권한 확인
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            statusCode: 403,
            error: "Forbidden",
            message: "관리자 권한이 필요합니다.",
        });
    }
    next();
};
exports.isAdmin = isAdmin;
