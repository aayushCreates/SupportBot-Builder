import { Request, Response } from 'express';
import prisma from '../config/db';
import openai from '../config/openai';
import { retrieveContext, buildMessages } from '../services/retrieval.service';
import { initializeSSE, sendSSEEvent } from '../services/stream.service';

const PLAN_LIMITS = {
  free: {
    messagesPerMonth: 50,
  },
  pro: {
    messagesPerMonth: 5000,
  },
};

export const handleChat = async (req: Request, res: Response) => {
  const { botId } = req.params as { botId: string };
  const { message, sessionId, history = [] } = req.body as { message: string, sessionId: string, history: any[] };

  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Message and sessionId are required' });
  }

  try {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        user: true,
      },
    }) as any;

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (bot.status !== 'ready') {
      return res.status(400).json({ error: 'Bot is not ready. Please train it first.' });
    }

    const user = bot.user;
    const limit = user.plan === 'pro' ? PLAN_LIMITS.pro.messagesPerMonth : PLAN_LIMITS.free.messagesPerMonth;

    if (user.messagesThisMonth >= limit) {
      return res.status(403).json({ 
        error: 'Monthly message limit reached. Please upgrade your plan or wait until next month.' 
      });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        botId: botId as string,
        sessionId: sessionId as string,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          botId: botId as string,
          sessionId: sessionId as string,
        },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    initializeSSE(res);   //  SSE is the easiest way to forward those chunks.

    const context = await retrieveContext(botId as string, message);

    const messages = buildMessages(bot.systemPrompt, context, history, message);

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      stream: true,
    });

    let fullAssistantResponse = '';

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullAssistantResponse += text;
        sendSSEEvent(res, { text });
      }
    }

    sendSSEEvent(res, { done: true });  //  This tells the frontend that the stream has ended.
    res.end();  

    prisma.message.create({
      data: {
        conversationId: conversation!.id,
        role: 'assistant',
        content: fullAssistantResponse,
      },
    }).catch((err: any) => console.error('Error saving assistant message:', err));

    prisma.bot.update({
      where: { id: botId as string },
      data: { messageCount: { increment: 1 } },
    }).catch((err: any) => console.error('Error updating bot message count:', err));

    prisma.user.update({
      where: { id: user.id },
      data: { messagesThisMonth: { increment: 1 } },
    }).catch((err: any) => console.error('Error updating user message count:', err));

  } catch (error: any) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Error processing chat' });
    } else {
      sendSSEEvent(res, { error: 'Error during message generation' });
      res.end();
    }
  }
};
