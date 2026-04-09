import { Router } from 'express';
import cors from 'cors';
import { handleChat } from '../controllers/chat.controller';
import { chatRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/:botId', cors({ origin: '*' }), chatRateLimiter, handleChat);

export default router;
