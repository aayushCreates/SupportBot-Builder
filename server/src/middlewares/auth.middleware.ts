import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/db';

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const clerkId = req.auth?.userId;

  if (!clerkId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.userId = user.id;
    req.userPlan = user.plan;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
