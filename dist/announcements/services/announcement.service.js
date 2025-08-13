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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnouncementService = exports.patchAnnouncementService = exports.createAnnouncementService = exports.findAnnouncementList = void 0;
const announcement_dto_1 = require("../dtos/announcement.dto");
const announcement_repository_1 = require("../repositories/announcement.repository");
const eventBus_1 = __importDefault(require("../../config/eventBus"));
const findAnnouncementList = (rawPage, rawSize) => __awaiter(void 0, void 0, void 0, function* () {
    const page = rawPage ? parseInt(rawPage, 10) : 1;
    const size = rawSize ? parseInt(rawSize, 10) : 10;
    if (isNaN(page) || page < 1)
        throw new Error("page값이 적절하지 않습니다");
    if (isNaN(size) || size < 1)
        throw new Error("size값이 적절하지 않습니다");
    const rawAnnouncements = yield (0, announcement_repository_1.findAnnouncements)(page, size);
    const totalCount = rawAnnouncements.length;
    return (0, announcement_dto_1.mapToAnnouncementListDTO)(rawAnnouncements, page, size, totalCount);
});
exports.findAnnouncementList = findAnnouncementList;
const createAnnouncementService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.writer_id) {
        throw new Error("writer_id가 누락되었습니다.");
    }
    if (!data.title || !data.content) {
        throw new Error("title과 content는 필수입니다.");
    }
    const result = yield (0, announcement_repository_1.createAnnouncementRepository)(data);
    // 공지 생성 후 알림 생성 이벤트 호출
    eventBus_1.default.emit('announcement.created', result.announcement_id);
    return (0, announcement_dto_1.mapToCreateAnnouncementDTO)(result);
});
exports.createAnnouncementService = createAnnouncementService;
const patchAnnouncementService = (announcementId, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!announcementId) {
        throw new Error("announcementId가 누락되었습니다.");
    }
    if (!data.title && !data.content) {
        throw new Error("수정될 title과 content가 필요합니다.");
    }
    const result = yield (0, announcement_repository_1.updateAnnouncementRepository)(announcementId, data);
    return (0, announcement_dto_1.mapToCreateAnnouncementDTO)(result);
});
exports.patchAnnouncementService = patchAnnouncementService;
const deleteAnnouncementService = (announcementId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!announcementId) {
        throw new Error("announcementId가 누락되었습니다.");
    }
    yield (0, announcement_repository_1.removeAnnouncementRepository)(announcementId);
    return { message: "삭제되었습니다." };
});
exports.deleteAnnouncementService = deleteAnnouncementService;
