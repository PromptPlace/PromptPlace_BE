import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';

const specs = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: { title: 'PromptPlace API', version: '1.0.0' },
  },
  apis: ['./src/**/*.ts'],
});

fs.writeFileSync('./swagger.json', JSON.stringify(specs, null, 2));
console.log('✅ Swagger spec 생성 완료: ./swagger.json');