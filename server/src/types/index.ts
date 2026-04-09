import { Request } from 'express';

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    getToken: (options?: any) => Promise<string | null>;
  };
  userId?: string; // DB user id
  userPlan?: string;
}

export type BotStatus = "untrained" | "training" | "ready" | "error";
export type SourceType = "pdf" | "url" | "text";
