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
exports.MessageService = void 0;
const typedi_1 = require("typedi");
const message_repository_1 = require("../repositories/message.repository");
const AppError_1 = require("../../errors/AppError");
let MessageService = class MessageService {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    getMessageById(message_id, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.messageRepository.findById(message_id);
            if (!message) {
                throw new AppError_1.AppError("존재하지 않는 메시지입니다.", 404, "NotFound");
            }
            if (message.receiver_id !== currentUserId) {
                throw new AppError_1.AppError("해당 메시지에 접근할 수 없습니다.", 403, "Forbidden");
            }
            if (!message.is_read) {
                yield this.messageRepository.markAsRead(message_id);
            }
            return {
                message: "메시지 내용 조회 성공",
                message_id: message.message_id,
                title: message.title,
                sender: message.sender.nickname,
                created_at: message.created_at,
                content: message.body,
                is_read: true,
                statusCode: 200,
            };
        });
    }
    getReceivedMessages(currentUserId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const limit = (_a = query.limit) !== null && _a !== void 0 ? _a : 10;
            const cursor = query.cursor;
            const is_read = query.is_read;
            const { messages, hasNextPage } = yield this.messageRepository.findReceivedMessagesWithCursor({
                receiver_id: currentUserId,
                limit,
                cursor,
                is_read,
            });
            return {
                message: "메시지 목록 조회 성공",
                messages: messages.map(msg => ({
                    message_id: msg.message_id,
                    title: msg.title,
                    sender: msg.sender.nickname,
                    created_at: msg.created_at.toISOString().split('T')[0], // 날짜만
                    is_read: msg.is_read,
                })),
                pagination: {
                    nextCursor: hasNextPage ? messages[messages.length - 1].message_id : null,
                    limit,
                },
                statusCode: 200,
            };
        });
    }
    markMessageAsRead(message_id, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.messageRepository.findById(message_id);
            if (!message) {
                throw new AppError_1.AppError("존재하지 않는 메시지입니다.", 404, "NotFound");
            }
            if (message.receiver_id !== currentUserId) {
                throw new AppError_1.AppError("해당 메시지에 접근할 수 없습니다.", 403, "Forbidden");
            }
            if (!message.is_read) {
                yield this.messageRepository.markAsRead(message_id);
            }
            return {
                message: "메시지가 읽음 처리되었습니다.",
                statusCode: 200,
            };
        });
    }
    deleteMessage(message_id, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.messageRepository.findById(message_id);
            if (!message) {
                throw new AppError_1.AppError("존재하지 않는 메시지입니다.", 404, "NotFound");
            }
            if (message.receiver_id !== currentUserId) {
                throw new AppError_1.AppError("해당 메시지를 삭제할 권한이 없습니다.", 403, "Forbidden");
            }
            yield this.messageRepository.softDelete(message_id);
            return {
                message: "메시지가 성공적으로 삭제되었습니다.",
                statusCode: 200,
            };
        });
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [message_repository_1.MessageRepository])
], MessageService);
