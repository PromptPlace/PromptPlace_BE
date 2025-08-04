"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryRepository = void 0;
const typedi_1 = require("typedi");
const prisma_1 = __importDefault(require("../../config/prisma"));
let InquiryRepository = class InquiryRepository {
    findInquiryById(inquiryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.inquiry.findUnique({
                where: {
                    inquiry_id: inquiryId,
                },
                include: {
                    sender: {
                        select: {
                            nickname: true,
                        },
                    },
                    receiver: {
                        select: {
                            nickname: true,
                        },
                    },
                },
            });
        });
    }
    createInquiry(senderId, createInquiryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.inquiry.create({
                data: {
                    sender_id: senderId,
                    receiver_id: createInquiryDto.receiver_id,
                    type: createInquiryDto.type,
                    status: "waiting",
                    title: createInquiryDto.title,
                    content: createInquiryDto.content,
                },
            });
        });
    }
    createInquiryReply(inquiryId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.inquiryReply.create({
                data: {
                    inquiry_id: inquiryId,
                    receiver_id: userId, // 스키마에 따라 답변자를 receiver_id에 저장
                    content: content,
                },
            });
        });
    }
    updateInquiryStatus(inquiryId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.inquiry.update({
                where: { inquiry_id: inquiryId },
                data: { status: status },
                select: {
                    inquiry_id: true,
                    status: true,
                    updated_at: true,
                },
            });
        });
    }
    findReceivedInquiries(receiverId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.inquiry.findMany({
                where: Object.assign({ receiver_id: receiverId }, (type && { type })),
                select: {
                    inquiry_id: true,
                    sender_id: true,
                    sender: {
                        select: {
                            nickname: true,
                        },
                    },
                    type: true,
                    status: true,
                    title: true,
                    created_at: true,
                    updated_at: true,
                },
                orderBy: {
                    created_at: "desc",
                },
            });
        });
    }
};
exports.InquiryRepository = InquiryRepository;
exports.InquiryRepository = InquiryRepository = __decorate([
    (0, typedi_1.Service)()
], InquiryRepository);
