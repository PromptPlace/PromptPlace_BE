export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PromptPlace API Docs',
      version: '1.0.0',
      description: '프롬프트플레이스 백엔드 API 문서',
    },
    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        jwt: [],
      },
    ],
  },
  apis: ['src/**/*.ts'], // JSDoc이 있는 파일 경로
};