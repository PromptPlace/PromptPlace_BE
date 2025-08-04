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
exports.InquiryController = void 0;
const inquiry_service_1 = require("../services/inquiry.service");
const inquiry_repository_1 = require("../repositories/inquiry.repository");
const member_repository_1 = require("../../members/repositories/member.repository");
const create_inquiry_dto_1 = require("../dtos/create-inquiry.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AppError_1 = require("../../errors/AppError");
const get_inquiries_dto_1 = require("../dtos/get-inquiries.dto");
const create_reply_dto_1 = require("../dtos/create-reply.dto");
class InquiryController {
    constructor() {
        this.inquiryService = new inquiry_service_1.InquiryService(new inquiry_repository_1.InquiryRepository(), new member_repository_1.MemberRepository());
    }
    createInquiry(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const senderId = req.user.user_id;
                const createInquiryDto = (0, class_transformer_1.plainToInstance)(create_inquiry_dto_1.CreateInquiryDto, req.body);
                const errors = yield (0, class_validator_1.validate)(createInquiryDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const inquiry = yield this.inquiryService.createInquiry(senderId, createInquiryDto);
                res.status(201).json({
                    message: "문의가 등록되었습니다.",
                    data: inquiry,
                    statusCode: 201,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getInquiryById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const inquiryId = parseInt(req.params.inquiryId, 10);
                const inquiry = yield this.inquiryService.getInquiryById(userId, inquiryId);
                res.status(200).json({
                    message: "문의 상세 정보 조회 완료",
                    data: inquiry,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getReceivedInquiries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const receiverId = req.user.user_id;
                const getInquiriesDto = (0, class_transformer_1.plainToInstance)(get_inquiries_dto_1.GetInquiriesDto, req.query);
                const errors = yield (0, class_validator_1.validate)(getInquiriesDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const inquiries = yield this.inquiryService.getReceivedInquiries(receiverId, getInquiriesDto.type);
                res.status(200).json({
                    message: "받은 문의 목록 조회 완료",
                    data: inquiries,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createInquiryReply(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const inquiryId = parseInt(req.params.inquiryId, 10);
                const dto = (0, class_transformer_1.plainToInstance)(create_reply_dto_1.CreateReplyDto, req.body);
                const errors = yield (0, class_validator_1.validate)(dto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const reply = yield this.inquiryService.createInquiryReply(userId, inquiryId, dto.content);
                res.status(201).json({
                    message: "문의 답변이 등록되었습니다.",
                    data: reply,
                    statusCode: 201,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    markInquiryAsRead(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const inquiryId = parseInt(req.params.inquiryId, 10);
                const updatedInquiry = yield this.inquiryService.markInquiryAsRead(userId, inquiryId);
                res.status(200).json({
                    message: "문의가 읽음 처리되었습니다.",
                    data: updatedInquiry,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.InquiryController = InquiryController;
