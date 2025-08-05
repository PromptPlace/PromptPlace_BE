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
exports.deleteAnnouncement = exports.patchAnnouncement = exports.createAnnouncement = exports.getAnnouncementList = void 0;
const announcement_service_1 = require("../services/announcement.service");
//비회원 이용 가능 
const getAnnouncementList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, announcement_service_1.findAnnouncementList)(req.query.page, req.query.size);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "공지사항 조회 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.getAnnouncementList = getAnnouncementList;
const createAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: "no user",
            message: "로그인이 필요합니다.",
        });
        return;
    }
    try {
        const result = yield (0, announcement_service_1.createAnnouncementService)(req.body);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "공지사항 생성 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.createAnnouncement = createAnnouncement;
const patchAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, announcement_service_1.patchAnnouncementService)(req.params.announcementId, req.body);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "공지사항 수정 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.patchAnnouncement = patchAnnouncement;
const deleteAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, announcement_service_1.deleteAnnouncementService)(req.params.announcementId);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "공지사항 삭제 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.deleteAnnouncement = deleteAnnouncement;
