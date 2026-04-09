import { Router } from 'express';
import { 
  listBots, 
  createBot, 
  getBot, 
  updateBot, 
  deleteBot,
  trainBotAction
} from '../controllers/bot.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { checkBotOwnership } from '../middlewares/ownership.middleware';

const router = Router();

// All bot routes require authentication
router.use(requireAuth);

router.get('/', listBots as any);
router.post('/', createBot as any);

// Routes below use botId and require ownership check
router.get('/:botId', checkBotOwnership as any, getBot as any);
router.patch('/:botId', checkBotOwnership as any, updateBot as any);
router.delete('/:botId', checkBotOwnership as any, deleteBot as any);
router.post('/:botId/train', checkBotOwnership as any, trainBotAction as any);

export default router;
