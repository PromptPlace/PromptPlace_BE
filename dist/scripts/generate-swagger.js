"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const fs_1 = __importDefault(require("fs"));
const specs = (0, swagger_jsdoc_1.default)({
    swaggerDefinition: {
        openapi: '3.0.0',
        info: { title: 'PromptPlace API', version: '1.0.0' },
    },
    apis: ['./src/**/*.ts'],
});
fs_1.default.writeFileSync('./swagger.json', JSON.stringify(specs, null, 2));
console.log('✅ Swagger spec 생성 완료: ./swagger.json');
