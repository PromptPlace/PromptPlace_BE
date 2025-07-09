import express, { ErrorRequestHandler } from 'express';
import { responseHandler } from "./middlewares/responseHandler";
import { errorHandler } from "./middlewares/errorHandler";
import swaggerUi from 'swagger-ui-express';
// import * as swaggerDocument from './docs/swagger/swagger.json'; 
// import { RegisterRoutes } from './routes/routes'; // tsoa가 생성하는 파일

const app = express();
app.use(express.json());
app.use(responseHandler);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const PORT = 3000;

// RegisterRoutes(app);

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