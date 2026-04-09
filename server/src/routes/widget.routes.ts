import { Router } from 'express';
import cors from 'cors';
import { getWidgetConfig } from '../controllers/widget.controller';

const router = Router();


router.get('/:botId/config', cors({ origin: '*' }), getWidgetConfig);

export default router;
