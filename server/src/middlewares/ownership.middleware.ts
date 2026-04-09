import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/db';

export const checkBotOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { botId } = req.params;
  const userId = req.userId;

  if (!botId) {
    return res.status(400).json({ error: 'Bot ID is required' });
  }

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { userId: true }
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (bot.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this bot' });
    }

    next();
  } catch (error) {
    console.error('Bot ownership check error:', error);
    res.status(500).json({ error: 'Internal server error during ownership check' });
  }
};
