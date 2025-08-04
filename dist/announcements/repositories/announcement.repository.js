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
exports.removeAnnouncementRepository = exports.updateAnnouncementRepository = exports.createAnnouncementRepository = exports.findAnnouncements = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../errors/AppError");
const prisma = new client_1.PrismaClient();
const findAnnouncements = (page, size) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = (page - 1) * size;
    return yield prisma.announcement.findMany({
        where: { is_visible: true },
        skip: offset,
        take: size,
        orderBy: {
            created_at: "desc",
        },
    });
});
exports.findAnnouncements = findAnnouncements;
const createAnnouncementRepository = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.announcement.create({
        data: {
            writer_id: data.writer_id,
            title: data.title,
            content: data.content,
            is_visible: true,
            file_url: data.file_url || null,
        },
    });
});
exports.createAnnouncementRepository = createAnnouncementRepository;
const updateAnnouncementRepository = (announcementId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedAnnouncementId = parseInt(announcementId, 10);
    return yield prisma.announcement.update({
        where: { announcement_id: parsedAnnouncementId },
        data: {
            title: data.title,
            content: data.content,
            file_url: data.file_url || null,
        },
    });
});
exports.updateAnnouncementRepository = updateAnnouncementRepository;
const removeAnnouncementRepository = (announcementId) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedAnnouncementId = parseInt(announcementId, 10);
    const announcement = yield prisma.announcement.findUnique({
        where: { announcement_id: parsedAnnouncementId },
    });
    if (!announcement) {
        throw new AppError_1.AppError("해당 공지사항이 존재하지 않습니다.", 404, "NotFound");
    }
    if (!announcement.is_visible) {
        throw new AppError_1.AppError("이미 삭제된 공지사항입니다.", 400, "AlreadyDeleted");
    }
    return yield prisma.announcement.update({
        where: { announcement_id: parsedAnnouncementId },
        data: {
            is_visible: false,
        },
    });
});
exports.removeAnnouncementRepository = removeAnnouncementRepository;
