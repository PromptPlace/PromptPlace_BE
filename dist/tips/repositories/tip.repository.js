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
exports.removeTipRepository = exports.updateTipRepository = exports.createTipRepository = exports.findtips = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../errors/AppError");
const prisma = new client_1.PrismaClient();
const findtips = (page, size) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = (page - 1) * size;
    return yield prisma.tip.findMany({
        where: { is_visible: true },
        skip: offset,
        take: size,
        orderBy: {
            created_at: "desc",
        },
    });
});
exports.findtips = findtips;
const createTipRepository = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.tip.create({
        data: {
            writer_id: data.writer_id,
            title: data.title,
            content: data.content,
            is_visible: true,
        },
    });
});
exports.createTipRepository = createTipRepository;
const updateTipRepository = (tipId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedTipId = parseInt(tipId, 10);
    return yield prisma.tip.update({
        where: { tip_id: parsedTipId },
        data: {
            title: data.title,
            content: data.content,
        },
    });
});
exports.updateTipRepository = updateTipRepository;
const removeTipRepository = (tipId) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedTipId = parseInt(tipId, 10);
    const tip = yield prisma.tip.findUnique({
        where: { tip_id: parsedTipId },
    });
    if (!tip) {
        throw new AppError_1.AppError("해당 팁이 존재하지 않습니다.", 404, "NotFound");
    }
    if (!tip.is_visible) {
        throw new AppError_1.AppError("이미 삭제된 팁입니다.", 400, "AlreadyDeleted");
    }
    return yield prisma.tip.update({
        where: { tip_id: parsedTipId },
        data: {
            is_visible: false,
        },
    });
});
exports.removeTipRepository = removeTipRepository;
