"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = __importDefault(require("../../controllers/auth.controller"));
const router = (0, express_1.Router)();
// GET /api/auth/login/naver
router.get('/', passport_1.default.authenticate('naver', { authType: 'reprompt', session: false }));
// GET /api/auth/login/naver/callback
router.get('/callback', passport_1.default.authenticate('naver', { session: false }), auth_controller_1.default.naverCallback);
exports.default = router;
