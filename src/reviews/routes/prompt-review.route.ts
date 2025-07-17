import {
    getReviewsByPromptId,
} from '../controllers/review.controller';

const express = require('express');
const app = express();

app.get('/', getReviewsByPromptId); // 리뷰 목록 조회


export default app;