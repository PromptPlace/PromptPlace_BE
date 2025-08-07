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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRequestController = void 0;
const purchase_request_service_1 = require("../services/purchase.request.service");
exports.PurchaseRequestController = {
    createPurchaseRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id; // JWT 인증 미들웨어에서 세팅된 사용자 ID
                if (!userId) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: '로그인이 필요합니다.',
                        statusCode: 401,
                    });
                }
                const dto = req.body;
                const result = yield purchase_request_service_1.PurchaseRequestService.createPurchaseRequest(userId, dto);
                res.status(result.statusCode).json(result);
            }
            catch (err) {
                next(err);
            }
        });
    },
};
