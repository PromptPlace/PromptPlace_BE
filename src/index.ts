import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import { responseHandler } from "./middlewares/responseHandler";
import { errorHandler } from "./middlewares/errorHandler";
import passport from './config/passport';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import authRouter from './auth/routes/auth.route'; // auth 라우터 경로 수정
import membersRouter from './members/routes/member.route'; // members 라우터 import
import promptRoutes from './prompts/prompt.route';
import ReviewRouter from './reviews/routes/review.route';
import promptDownloadRouter from './prompts/routes/prompt.downlaod.route'
import promptLikeRouter from './prompts/routes/prompt.like.route';
// import * as swaggerDocument from './docs/swagger/swagger.json'; 
// import { RegisterRoutes } from './routes/routes'; // tsoa가 생성하는 파일

const app = express();
app.use(express.json());

app.use(responseHandler);

// Session 설정 (OAuth용)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 인증 라우터
app.use('/api/auth', authRouter); // /api 접두사 추가

// 회원 라우터
app.use('/api/members', membersRouter);

// 리뷰 라우터
app.use('/api/reviews', ReviewRouter);

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const PORT = 3000;

// RegisterRoutes(app);

// 라우트 등록

// 프롬프트 관련 라우터
  // 프롬프트 검색 API
app.use('/api/prompts', promptRoutes);

  // 프롬프트 무료 다운로드 라우터
app.use('/api/prompts', promptDownloadRouter);

  // 프롬프트 찜 라우터
app.use('/api/prompts', promptLikeRouter);

// 예시 라우터
app.get("/", (req, res) => {
  res.success({ message: "Hello World" });
});

// 예외 테스트
app.get("/error", () => {
  throw new Error("테스트 오류입니다.");
});

app.use(errorHandler as ErrorRequestHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});