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
exports.deleteTip = exports.patchTip = exports.createTip = exports.getTipList = void 0;
const tip_service_1 = require("../services/tip.service");
//비회원 이용 가능 - 인증 필요 X
const getTipList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, tip_service_1.findTipList)(req.query.page, req.query.size);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "팁 목록 조회 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.getTipList = getTipList;
// 팁 생성 - 관리자 인증 필요
const createTip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: "no user",
            message: "로그인이 필요합니다.",
        });
        return;
    }
    try {
        const result = yield (0, tip_service_1.createTipService)(req.body);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "팁 생성 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.createTip = createTip;
const patchTip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, tip_service_1.patchTipService)(req.params.tipId, req.body);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "팁 수정 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.patchTip = patchTip;
const deleteTip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, tip_service_1.deleteTipService)(req.params.tipId);
        return res.success({
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.name || "InternalServerError",
            message: err.message || "팁 삭제 중 오류가 발생했습니다.",
            statusCode: err.statusCode || 500,
        });
    }
});
exports.deleteTip = deleteTip;
