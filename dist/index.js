"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const responseHandler_1 = require("./middlewares/responseHandler");
const errorHandler_1 = require("./middlewares/errorHandler");
require("reflect-metadata");
const passport_1 = __importDefault(require("./config/passport"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options_1 = require("./docs/swagger/options");
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./auth/routes/auth.route")); // auth 라우터 경로 수정
const member_route_1 = __importDefault(require("./members/routes/member.route")); // members 라우터 import
const prompt_route_1 = __importDefault(require("./prompts/routes/prompt.route")); // 프롬프트 관련 라우터
const review_route_1 = __importDefault(require("./reviews/routes/review.route"));
const prompt_downlaod_route_1 = __importDefault(require("./prompts/routes/prompt.downlaod.route"));
const prompt_like_route_1 = __importDefault(require("./prompts/routes/prompt.like.route"));
const tip_route_1 = __importDefault(require("./tips/routes/tip.route")); // 팁 라우터 import
const inquiry_route_1 = __importDefault(require("./inquiries/routes/inquiry.route"));
const report_route_1 = __importDefault(require("./reports/routes/report.route")); // 신고 라우터 import
const announcement_route_1 = __importDefault(require("./announcements/routes/announcement.route")); // 공지사항 라우터 import
const notification_route_1 = __importDefault(require("./notifications/routes/notification.route")); // 알림 라우터 import
require("./notifications/listeners/notification.listener"); // 알림 리스터 import
const message_route_1 = __importDefault(require("./messages/routes/message.route"));
const PORT = 3000;
const app = (0, express_1.default)();
// 1. 응답 핸들러(json 파서보다 위에)
app.use(responseHandler_1.responseHandler);
// 2. express 기본 설정들
app.use(express_1.default.json());
// CORS 설정
const allowedOrigins = ['https://promptplace-develop.vercel.app'];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true, // 세션 쿠키 등 인증 정보 주고받을 경우 true
}));
// Session 설정 (OAuth용)
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24시간
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup((0, swagger_jsdoc_1.default)(options_1.swaggerOptions)));
// 3. 모든 라우터들 
// 인증 라우터
app.use("/api/auth", auth_route_1.default); // /api 접두사 추가
// 회원 라우터
app.use("/api/members", member_route_1.default);
// 리뷰 라우터
app.use('/api/reviews', review_route_1.default);
// 프롬프트 관련 라우터
// 프롬프트 검색 API
app.use("/api/prompts", prompt_route_1.default);
// 프롬프트 무료 다운로드 라우터
app.use("/api/prompts", prompt_downlaod_route_1.default);
// 프롬프트 찜 라우터
app.use("/api/prompts", prompt_like_route_1.default);
// 팁 라우터
app.use("/api/tips", tip_route_1.default);
//공지사항 라우터
app.use('/api/announcements', announcement_route_1.default);
// 문의 라우터
app.use('/api/inquiries', inquiry_route_1.default);
app.use('/api/reports', report_route_1.default);
// 알림 라우터
app.use('/api/notifications', notification_route_1.default);
// 메시지 라우터
app.use('/api/messages', message_route_1.default);
// 예시 라우터
app.get("/", (req, res) => {
    res.success({ message: "Hello World" });
});
// 예외 테스트
app.get("/error", () => {
    throw new Error("테스트 오류입니다.");
});
// 4. 마지막 에러 핸들러 
app.use(errorHandler_1.errorHandler);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
