"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
const responseHandler = (req, res, next) => {
    res.success = (data, message = "요청이 성공적으로 처리되었습니다.") => {
        return res.status(200).json({
            message,
            data,
            statusCode: 200,
        });
    };
    res.fail = ({ statusCode = 500, error = "InternalServerError", message = "알 수 없는 오류가 발생했습니다.", }) => {
        return res.status(statusCode).json({
            error,
            message,
            statusCode,
        });
    };
    next();
};
exports.responseHandler = responseHandler;
