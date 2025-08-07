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
exports.MessageController = void 0;
const typedi_1 = require("typedi");
const message_service_1 = require("../services/message.service");
let MessageController = class MessageController {
    constructor(messageService) {
        this.messageService = messageService;
        this.getMessageById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message_id = parseInt(req.params.message_id, 10);
                const currentUserId = req.user.user_id;
                const message = yield this.messageService.getMessageById(message_id, currentUserId);
                res.status(200).json(message);
            }
            catch (error) {
                next(error);
            }
        });
        this.getReceivedMessages = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUserId = req.user.user_id;
                const { limit, cursor, is_read } = req.query;
                const result = yield this.messageService.getReceivedMessages(currentUserId, {
                    limit: limit ? parseInt(limit, 10) : undefined,
                    cursor: cursor ? parseInt(cursor, 10) : undefined,
                    is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
                });
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.markAsRead = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message_id = parseInt(req.params.message_id, 10);
                const user_id = req.user.user_id;
                const result = yield this.messageService.markMessageAsRead(message_id, user_id);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.deleteMessage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message_id = parseInt(req.params.message_id, 10);
                const user_id = req.user.user_id;
                const result = yield this.messageService.deleteMessage(message_id, user_id);
                res.status(200).json(result);
            }
            catch (err) {
                next(err);
            }
        });
    }
};
exports.MessageController = MessageController;
exports.MessageController = MessageController = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageController);
