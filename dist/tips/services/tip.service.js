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
exports.deleteTipService = exports.patchTipService = exports.createTipService = exports.findTipList = void 0;
const tip_dto_1 = require("../dtos/tip.dto");
const tip_repository_1 = require("../repositories/tip.repository");
const findTipList = (rawPage, rawSize) => __awaiter(void 0, void 0, void 0, function* () {
    const page = rawPage ? parseInt(rawPage, 10) : 1;
    const size = rawSize ? parseInt(rawSize, 10) : 10;
    if (isNaN(page) || page < 1)
        throw new Error("page값이 적절하지 않습니다");
    if (isNaN(size) || size < 1)
        throw new Error("size값이 적절하지 않습니다");
    const rawTips = yield (0, tip_repository_1.findtips)(page, size);
    const totalCount = rawTips.length;
    return (0, tip_dto_1.mapToTipListDTO)(rawTips, page, size, totalCount);
});
exports.findTipList = findTipList;
const createTipService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.writer_id) {
        throw new Error("writer_id가 누락되었습니다.");
    }
    if (!data.title || !data.content) {
        throw new Error("title과 content는 필수입니다.");
    }
    const result = yield (0, tip_repository_1.createTipRepository)(data);
    return (0, tip_dto_1.mapToCreateTipDTO)(result);
});
exports.createTipService = createTipService;
const patchTipService = (tipId, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!tipId) {
        throw new Error("tipId가 누락되었습니다.");
    }
    if (!data.title && !data.content) {
        throw new Error("수정될 title과 content가 필요합니다.");
    }
    const result = yield (0, tip_repository_1.updateTipRepository)(tipId, data);
    return (0, tip_dto_1.mapToCreateTipDTO)(result);
});
exports.patchTipService = patchTipService;
const deleteTipService = (tipId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!tipId) {
        throw new Error("tipId가 누락되었습니다.");
    }
    yield (0, tip_repository_1.removeTipRepository)(tipId);
    return { message: "삭제되었습니다." };
});
exports.deleteTipService = deleteTipService;
