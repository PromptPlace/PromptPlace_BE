import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import { responseHandler } from "./middlewares/responseHandler";
import { errorHandler } from "./middlewares/errorHandler";

import passport from './config/passport';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './docs/swagger/options';
import session from 'express-session';
import cors from "cors";
import authRouter from './auth/routes/auth.route'; // auth 라우터 경로 수정
import membersRouter from './members/routes/member.route'; // members 라우터 import
import promptRoutes from './prompts/routes/prompt.route'; // 프롬프트 관련 라우터
import ReviewRouter from './reviews/routes/review.route';
import promptDownloadRouter from './prompts/routes/prompt.downlaod.route';
import promptLikeRouter from './prompts/routes/prompt.like.route';
import tipRouter from "./tips/routes/tip.route"; // 팁 라우터 import
import inquiryRouter from './inquiries/routes/inquiry.route';
import reportRouter from './reports/routes/report.route'; // 신고 라우터 import
import announcementRouter from './announcements/routes/announcement.route'; // 공지사항 라우터 import

const PORT = 3000;
const app = express();
// 1. 응답 핸들러(json 파서보다 위에)
app.use(responseHandler);

// 2. express 기본 설정들
app.use(express.json());

// CORS 설정
const allowedOrigins = ['https://promptplace-develop.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // 세션 쿠키 등 인증 정보 주고받을 경우 true
}));


// Session 설정 (OAuth용)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// 3. 모든 라우터들 
// 인증 라우터
app.use("/api/auth", authRouter); // /api 접두사 추가

// 회원 라우터
app.use("/api/members", membersRouter);

// 리뷰 라우터
app.use('/api/reviews', ReviewRouter);

// 프롬프트 관련 라우터
// 프롬프트 검색 API
app.use("/api/prompts", promptRoutes);

// 프롬프트 무료 다운로드 라우터
app.use("/api/prompts", promptDownloadRouter);

// 프롬프트 찜 라우터
app.use("/api/prompts", promptLikeRouter);

// 팁 라우터
app.use("/api/tips", tipRouter);

//공지사항 라우터
app.use('/api/announcements', announcementRouter);

// 문의 라우터
app.use('/api/inquiries', inquiryRouter);

// 예시 라우터
app.get("/", (req, res) => {
  res.success({ message: "Hello World" });
});

// 예외 테스트
app.get("/error", () => {
  throw new Error("테스트 오류입니다.");
});

// 4. 마지막 에러 핸들러 
app.use(errorHandler as ErrorRequestHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});