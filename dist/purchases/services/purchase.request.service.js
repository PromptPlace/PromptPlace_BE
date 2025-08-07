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
exports.PurchaseRequestService = void 0;
const purchase_request_repository_1 = require("../repositories/purchase.request.repository");
const AppError_1 = require("../../errors/AppError");
exports.PurchaseRequestService = {
    createPurchaseRequest(userId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = yield purchase_request_repository_1.PurchaseRequestRepository.findPromptById(dto.prompt_id);
            if (!prompt) {
                throw new AppError_1.AppError('해당 프롬프트를 찾을 수 없습니다.', 404, 'NotFound');
            }
            if (prompt.is_free) {
                throw new AppError_1.AppError('해당 프롬프트는 무료입니다. 결제가 필요하지 않습니다.', 400, 'BadRequest');
            }
            const existing = yield purchase_request_repository_1.PurchaseRequestRepository.findExistingPurchase(userId, dto.prompt_id);
            if (existing) {
                throw new AppError_1.AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');
            }
            return {
                message: '결제 요청이 정상 처리되었습니다.',
                payment_gateway: dto.pg,
                merchant_uid: dto.merchant_uid,
                redirect_url: 'https://pay.portone.io/payment/redirect', // 실제 결제창 redirect url
                statusCode: 200,
            };
        });
    },
};
