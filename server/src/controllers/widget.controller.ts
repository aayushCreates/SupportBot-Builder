import { Request, Response } from 'express';
import prisma from '../config/db';


export const getWidgetConfig = async (req: Request, res: Response) => {
  const { botId } = req.params as { botId: string };

  try {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        name: true,
        welcomeMessage: true,
        placeholder: true,
        primaryColor: true,
        logoUrl: true,
      },
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json(bot);
  } catch (error: any) {
    console.error('Widget config error:', error);
    return res.status(500).json({ error: 'Error fetching widget configuration' });
  }
};
