import { Request, Response } from 'express';
import prisma from '../config/db';

const PLAN_LIMITS: Record<string, { bots: number; messages: number }> = {
  free: { bots: 1, messages: 1000 },
  pro: { bots: 20, messages: 50000 },
  enterprise: { bots: 100, messages: 1000000 },
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        _count: {
          select: { bots: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const planKey = user.plan.toLowerCase();
    const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.free;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      usage: {
        bots: user._count.bots,
        messages: user.messagesThisMonth
      },
      limits: {
        bots: limits.bots,
        messages: limits.messages
      }
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
};
