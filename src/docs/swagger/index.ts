import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './options';

export const swaggerSpec = swaggerJSDoc(swaggerOptions);