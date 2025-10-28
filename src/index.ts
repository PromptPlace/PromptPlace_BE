import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import { responseHandler } from "./middlewares/responseHandler";
import { errorHandler } from "./middlewares/errorHandler";
import "reflect-metadata";
import passport from "./config/passport";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "./docs/swagger/options";
import session from "express-session";
import cors from "cors";
import authRouter from "./auth/routes/auth.route"; // auth 라우터 경로 수정
import membersRouter from "./members/routes/member.route"; // members 라우터 import
import promptRoutes from "./prompts/routes/prompt.route"; // 프롬프트 관련 라우터
import ReviewRouter from "./reviews/routes/review.route";
import purchaseRouter from "./purchases/routes/purchase.request.route";
import settlementRouter from "./settlements/routes/settlement.route";
import withdrawalRouter from "./withdrawals/routes/withdrawal.route";
import accountRouter from "./accounts/routes/account.route";
import promptDownloadRouter from "./prompts/routes/prompt.downlaod.route";
import promptLikeRouter from "./prompts/routes/prompt.like.route";
import tipRouter from "./tips/routes/tip.route"; // 팁 라우터 import
import inquiryRouter from "./inquiries/routes/inquiry.route";
import reportRouter from "./reports/routes/report.route"; // 신고 라우터 import
import announcementRouter from "./announcements/routes/announcement.route"; // 공지사항 라우터 import
import notificationRouter from "./notifications/routes/notification.route"; // 알림 라우터 import
import "./notifications/listeners/notification.listener"; // 알림 리스터 import
import messageRouter from "./messages/routes/message.route";
import adminPromptRouter from "./prompts/routes/admin-prompt.route";
import adminMemberRouter from "./members/routes/admin-member.route";
import signupRouter from "./signup/routes/signup.route"

const PORT = 3000;
const app = express();
// 1. 응답 핸들러(json 파서보다 위에)
app.use(responseHandler);

// 2. express 기본 설정들
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 설정 추가 (uploads 폴더)
app.use("/uploads", express.static("uploads"));

// CORS 설정
const allowedOrigins = [
  "https://www.promptplace.kr",
  "http://localhost:5173",
  "https://promptplace-develop.vercel.app",
  "http://52.79.208.145:3000",
  "http://52.79.208.145",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // origin이 undefined일 수 있으므로 체크 필요
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

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
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerJsdoc(swaggerOptions))
);

// 3. 모든 라우터들

// 회원가입 라우터
app.use("/api/auth/signup", signupRouter);

// 인증 라우터
app.use("/api/auth", authRouter); // /api 접두사 추가

// 회원 라우터
app.use("/api/members", membersRouter);

// 계좌 라우터

app.use(
  "/api/members/me",
  express.text({ type: "text/plain" }),
  (req, _res, next) => {
    if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch {}
    }
    next();
  },
  accountRouter
);

// 리뷰 라우터
app.use("/api/reviews", ReviewRouter);

// 프롬프트 관련 라우터
// 프롬프트 검색 API
app.use("/api/prompts", promptRoutes);

// 프롬프트 결제 라우터
app.use(
  "/api/prompts/purchases",
  express.text({ type: "text/plain" }),
  (req, _res, next) => {
    if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch {}
    }
    next();
  },
  purchaseRouter
);

// 프롬프트 다운로드 라우터
app.use("/api/prompts", promptDownloadRouter);

// 프롬프트 찜 라우터
app.use("/api/prompts", promptLikeRouter);

// admin
app.use("/api/admin/prompts", adminPromptRouter);
app.use("/api/admin", adminMemberRouter);

// 팁 라우터
app.use("/api/tips", tipRouter);

// 정산 라우터
app.use("/api/settlements", settlementRouter);
app.use("/api/settlements", withdrawalRouter);

//공지사항 라우터
app.use("/api/announcements", announcementRouter);

// 문의 라우터
app.use("/api/inquiries", inquiryRouter);

app.use("/api/reports", reportRouter);
// 알림 라우터
app.use("/api/notifications", notificationRouter);

// 메시지 라우터
app.use("/api/messages", messageRouter);

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

// 도커 헬스체크 라우터
app.get('/health', (req, res) => {
  res.status(200).send('OK');  
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
