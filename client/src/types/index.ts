export type PlanType = "free" | "pro";
export type BotStatus = "untrained" | "training" | "ready" | "error";
export type SourceType = "pdf" | "url" | "text";
export type SourceStatus = "pending" | "processing" | "ready" | "error";
export type MessageRole = "user" | "assistant";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  plan: PlanType;
  messagesThisMonth: number;
  createdAt: string;
}

export interface Bot {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  primaryColor: string;
  logoUrl: string | null;
  welcomeMessage: string;
  placeholder: string;
  systemPrompt: string;
  status: BotStatus;
  trainingError: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sources: number;
    conversations: number;
  };
}

export interface Source {
  id: string;
  botId: string;
  type: SourceType;
  name: string;
  content: string | null;
  fileUrl: string | null;
  status: SourceStatus;
  chunkCount: number;
  errorMsg: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  botId: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface WidgetConfig {
  name: string;
  welcomeMessage: string;
  placeholder: string;
  primaryColor: string;
  logoUrl: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export const PLAN_LIMITS = {
  free: {
    bots: 1,
    sourcesPerBot: 3,
    messagesPerMonth: 50,
    fileSizeMB: 5,
  },
  pro: {
    bots: 10,
    sourcesPerBot: 50,
    messagesPerMonth: 5000,
    fileSizeMB: 25,
  },
};
