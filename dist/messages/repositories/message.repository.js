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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const typedi_1 = require("typedi");
const client_1 = require("@prisma/client");
let MessageRepository = class MessageRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * 메시지 생성
     */
    createMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.message.create({
                data: {
                    sender_id: data.sender_id,
                    receiver_id: data.receiver_id,
                    title: data.title,
                    body: data.body,
                },
            });
        });
    }
    /**
     * 메시지 단건 조회
     */
    findById(message_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.message.findUnique({
                where: { message_id },
                include: {
                    sender: {
                        select: {
                            nickname: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * 유저의 받은 메시지 목록
     */
    findReceivedMessages(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.message.findMany({
                where: {
                    receiver_id: user_id,
                    is_deleted: false,
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
        });
    }
    /**
     * 메시지 읽음 처리
     */
    markAsRead(message_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.message.update({
                where: { message_id },
                data: {
                    is_read: true,
                    read_at: new Date(),
                },
            });
        });
    }
    /**
     * 메시지 삭제 (소프트 딜리트)
     */
    softDelete(message_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.message.update({
                where: { message_id },
                data: {
                    is_deleted: true,
                },
            });
        });
    }
    /**
   * 메시지 목록 조회 (커서 기반 페이지네이션)
   */
    findReceivedMessagesWithCursor(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { receiver_id, limit, cursor, is_read } = params;
            const where = {
                receiver_id,
                is_deleted: false,
            };
            if (typeof is_read === "boolean") {
                where.is_read = is_read;
            }
            const messages = yield this.prisma.message.findMany(Object.assign(Object.assign({ where, take: limit + 1 }, (cursor && {
                cursor: { message_id: cursor },
                skip: 1,
            })), { include: {
                    sender: {
                        select: {
                            nickname: true,
                        },
                    },
                }, orderBy: {
                    message_id: 'desc', // 최신 메시지 순
                } }));
            const hasNextPage = messages.length > limit;
            return {
                messages: hasNextPage ? messages.slice(0, limit) : messages,
                hasNextPage,
            };
        });
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, typedi_1.Service)()
], MessageRepository);
