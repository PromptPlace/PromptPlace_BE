"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.InquiryService = void 0;
const typedi_1 = require("typedi");
const inquiry_repository_1 = require("../repositories/inquiry.repository");
const member_repository_1 = require("../../members/repositories/member.repository");
const AppError_1 = require("../../errors/AppError");
let InquiryService = class InquiryService {
    constructor(inquiryRepository, memberRepository) {
        this.inquiryRepository = inquiryRepository;
        this.memberRepository = memberRepository;
    }
    createInquiry(senderId, createInquiryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const receiver = yield this.memberRepository.findUserById(createInquiryDto.receiver_id);
            if (!receiver) {
                throw new AppError_1.AppError("해당 수신자를 찾을 수 없습니다.", 404, "NotFound");
            }
            return this.inquiryRepository.createInquiry(senderId, createInquiryDto);
        });
    }
    getInquiryById(userId, inquiryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const inquiry = yield this.inquiryRepository.findInquiryById(inquiryId);
            if (!inquiry) {
                throw new AppError_1.AppError("해당 문의를 찾을 수 없습니다.", 404, "NotFound");
            }
            if (inquiry.sender_id !== userId && inquiry.receiver_id !== userId) {
                throw new AppError_1.AppError("해당 문의를 조회할 권한이 없습니다.", 403, "Forbidden");
            }
            return {
                inquiry_id: inquiry.inquiry_id,
                sender_id: inquiry.sender_id,
                sender_nickname: inquiry.sender.nickname,
                receiver_id: inquiry.receiver_id,
                receiver_nickname: inquiry.receiver.nickname,
                type: inquiry.type,
                status: inquiry.status,
                title: inquiry.title,
                content: inquiry.content,
                created_at: inquiry.created_at,
                updated_at: inquiry.updated_at,
            };
        });
    }
    createInquiryReply(userId, inquiryId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 문의 존재 여부 확인
            const inquiry = yield this.inquiryRepository.findInquiryById(inquiryId);
            if (!inquiry) {
                throw new AppError_1.AppError("해당 문의를 찾을 수 없습니다.", 404, "NotFound");
            }
            // 2. 답변 권한 확인 (문의의 수신자인지)
            if (inquiry.receiver_id !== userId) {
                throw new AppError_1.AppError("해당 문의에 답변할 권한이 없습니다.", 403, "Forbidden");
            }
            // 3. 답변 생성
            return this.inquiryRepository.createInquiryReply(inquiryId, userId, content);
        });
    }
    markInquiryAsRead(userId, inquiryId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 문의 존재 여부 확인
            const inquiry = yield this.inquiryRepository.findInquiryById(inquiryId);
            if (!inquiry) {
                throw new AppError_1.AppError("해당 문의를 찾을 수 없습니다.", 404, "NotFound");
            }
            // 2. 읽음 처리 권한 확인 (문의의 수신자인지)
            if (inquiry.receiver_id !== userId) {
                throw new AppError_1.AppError("해당 문의를 읽음 처리할 권한이 없습니다.", 403, "Forbidden");
            }
            // 3. 문의 상태 변경
            return this.inquiryRepository.updateInquiryStatus(inquiryId, "read");
        });
    }
    getReceivedInquiries(receiverId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const inquiries = yield this.inquiryRepository.findReceivedInquiries(receiverId, type);
            return inquiries.map((inquiry) => ({
                inquiry_id: inquiry.inquiry_id,
                sender_id: inquiry.sender_id,
                sender_nickname: inquiry.sender.nickname,
                type: inquiry.type,
                status: inquiry.status,
                title: inquiry.title,
                created_at: inquiry.created_at,
                updated_at: inquiry.updated_at,
            }));
        });
    }
};
exports.InquiryService = InquiryService;
exports.InquiryService = InquiryService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [inquiry_repository_1.InquiryRepository,
        member_repository_1.MemberRepository])
], InquiryService);
