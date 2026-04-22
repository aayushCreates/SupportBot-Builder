import { Request } from 'express';

export interface AuthRequest extends Request {
  clerkId?: string;
  userId?: string;
  userPlan?: string;
}

export type BotStatus = "untrained" | "training" | "ready" | "error";
export type SourceType = "pdf" | "url" | "text";

declare global {
  namespace Express {
    interface Request {
      clerkId?: string;
      userId?: string;
      userPlan?: string;
    }
  }
}


