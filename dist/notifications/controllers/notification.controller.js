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
exports.getNotificationList = exports.toggleNotificationSubscription = void 0;
const notification_service_1 = require("../services/notification.service");
const toggleNotificationSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const prompterId = (_a = (req.params.prompterId)) === null || _a === void 0 ? void 0 : _a.toString();
        if (!prompterId) {
            res.status(400).json({ message: 'prompterId가 없습니다.' });
            return;
        }
        const result = yield (0, notification_service_1.createSubscriptionService)(prompterId, userId);
        if (result.subscribed === true) {
            res.success(Object.assign({ message: '해당 프롬프터 알림을 등록했습니다.' }, result));
        }
        else {
            res.success(Object.assign({ message: '해당 프롬프터 알림을 취소했습니다.' }, result));
        }
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '리뷰 작성 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.toggleNotificationSubscription = toggleNotificationSubscription;
// 알림 목록 조회
const getNotificationList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const cursor = req.query.cursor;
        const limit = req.query.limit;
        const notifications = yield (0, notification_service_1.findUserNotificationsService)(userId, cursor, limit);
        res.success(Object.assign({}, notifications));
    }
    catch (err) {
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '사용자 알림 목록을 불러오는 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.getNotificationList = getNotificationList;
