import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/db';
import { z } from 'zod';
import { addTrainingJob } from '../queues/training.queue';

export const trainBotAction = async (req: AuthRequest, res: Response) => {
  try {
    const { botId } = req.params as { botId: string };
    const userId = req.userId!;

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        sources: {
          where: { status: 'ready' }
        }
      }
    });

    if (!bot || bot.userId !== userId) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (bot.sources.length === 0) {
      return res.status(400).json({ error: 'Add at least one ready source before training.' });
    }

    // Add to queue
    await addTrainingJob(botId);

    res.status(202).json({ message: 'Training started' });
  } catch (error) {
    console.error('Train bot error:', error);
    res.status(500).json({ error: 'Failed to start training' });
  }
};

// Validation schemas
const createBotSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
});

const updateBotSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  welcomeMessage: z.string().max(500).optional(),
  placeholder: z.string().max(100).optional(),
  systemPrompt: z.string().max(5000).optional(),
  logoUrl: z.string().url().optional().nullable(),
});

export const listBots = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const bots = await prisma.bot.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            sources: true,
            conversations: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(bots);
  } catch (error) {
    console.error('List bots error:', error);
    res.status(500).json({ error: 'Failed to list bots' });
  }
};

export const createBot = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createBotSchema.parse(req.body);
    const userId = req.userId!;
    const userPlan = req.userPlan!;

    // Check plan limits
    const botCount = await prisma.bot.count({ where: { userId } });
    if (userPlan === 'free' && botCount >= 1) {
      return res.status(403).json({ 
        error: 'Free plan limit reached. Upgrade to Pro to create more bots.' 
      });
    }

    const bot = await prisma.bot.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    res.status(201).json(bot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Create bot error:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
};

export const getBot = async (req: AuthRequest, res: Response) => {
  try {
    const { botId } = req.params as { botId: string };
    const userId = req.userId!;

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        sources: {
          orderBy: { createdAt: 'desc' },
        },
        conversations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { messages: true },
            },
          },
        },
      },
    });

    if (!bot || bot.userId !== userId) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Get bot error:', error);
    res.status(500).json({ error: 'Failed to get bot' });
  }
};

export const updateBot = async (req: AuthRequest, res: Response) => {
  try {
    const { botId } = req.params as { botId: string };
    const userId = req.userId!;
    const validatedData = updateBotSchema.parse(req.body);

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot || bot.userId !== userId) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // If system prompt changed, set status to untrained
    let status = bot.status;
    if (validatedData.systemPrompt && validatedData.systemPrompt !== bot.systemPrompt) {
      status = 'untrained';
    }

    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: {
        ...validatedData,
        status,
      },
    });

    res.json(updatedBot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Update bot error:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
};

export const deleteBot = async (req: AuthRequest, res: Response) => {
  try {
    const { botId } = req.params as { botId: string };
    const userId = req.userId!;

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot || bot.userId !== userId) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Note: Pinecone index deletion would happen here or in a background job
    // deleteIndex(botId)
    
    await prisma.bot.delete({
      where: { id: botId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete bot error:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
};
