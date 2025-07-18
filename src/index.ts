import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import { responseHandler } from "./middlewares/responseHandler";
import { errorHandler } from "./middlewares/errorHandler";
import passport from './config/passport';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import authRouter from './routes/auth';
import promptRoutes from './prompts/prompt.route';
import promptReviewRouter from './reviews/routes/prompt-review.route';
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
app.use('/auth', authRouter);

// 프롬프트 리뷰 라우터
app.use('/api/prompts/:promptId/reviews', promptReviewRouter);

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const PORT = 3000;

// RegisterRoutes(app);

// 라우트 등록

// 프롬프트 관련 라우트
  // 프롬프트 검색 API
app.use('/api/prompts', promptRoutes);
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