"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../errors/AppError");
const errorHandler = (err, req, res, next) => {
    if (res.headersSent)
        return next(err);
    if (err instanceof AppError_1.AppError) {
        res.fail({
            statusCode: err.statusCode,
            error: err.error,
            message: err.message,
        });
    }
    else {
        res.fail({
            statusCode: 500,
            error: "InternalServerError",
            message: err.message || "알 수 없는 오류가 발생했습니다.",
        });
    }
};
exports.errorHandler = errorHandler;
