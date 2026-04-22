import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/db';
import { z } from 'zod';
import { parsePdf } from '../services/ingestion/pdf.service';
import { scrapeUrl } from '../services/ingestion/url.service';
import { cleanText } from '../services/ingestion/text.service';
import cloudinary from '../config/cloudinary';

const createSourceSchema = z.object({
  type: z.enum(['pdf', 'url', 'text']),
  name: z.string().min(2).max(100).optional(),
  content: z.string().optional(),
  url: z.string().url().optional(),
});

export const listSources = async (req: AuthRequest, res: Response) => {
  try {
    const { botId } = req.params as { botId: string };
    
    const sources = await prisma.source.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sources);
  } catch (error) {
    console.error('List sources error:', error);
    res.status(500).json({ error: 'Failed to list sources' });
  }
};

export const addSource = async (req: AuthRequest, res: Response) => {
  try {
    const { botId } = req.params as { botId: string };
    const body = createSourceSchema.parse(req.body);
    const userPlan = req.userPlan!;

    // Case 1: PDF (handled via file upload middleware, so file will be on req.file)
    if (body.type === 'pdf') {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'PDF file is required for type "pdf"' });
      }

      // Check plan limits (source count)
      const sourceCount = await prisma.source.count({ where: { botId } });
      const PLAN_LIMITS = { free: 3, pro: 50 };
      const limit = userPlan === 'pro' ? PLAN_LIMITS.pro : PLAN_LIMITS.free;

      if (sourceCount >= limit) {
        return res.status(403).json({ error: `Source limit reached for ${userPlan} plan.` });
      }

      // Upload to Cloudinary
      // We wrap it in a promise for better handling
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `bots/${botId}/sources` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      const uploadResult = await uploadPromise;
      const fileUrl = uploadResult.secure_url;

      // Extract text directly from the buffer to avoid network errors
      const extractedText = await parsePdf(file.buffer);

      const source = await prisma.source.create({
        data: {
          botId,
          type: 'pdf',
          name: body.name || file.originalname,
          content: extractedText,
          fileUrl,
          status: 'ready',
        },
      });

      // mark bot as untrained
      await prisma.bot.update({ where: { id: botId as string }, data: { status: 'untrained' } });

      return res.status(201).json(source);
    }

    // Case 2: URL
    if (body.type === 'url') {
      if (!body.url) {
        return res.status(400).json({ error: 'URL is required for type "url"' });
      }

      const extractedText = await scrapeUrl(body.url);

      const source = await prisma.source.create({
        data: {
          botId,
          type: 'url',
          name: body.name || body.url,
          content: extractedText,
          status: 'ready',
        },
      });

      await prisma.bot.update({ where: { id: botId as string }, data: { status: 'untrained' } });
      return res.status(201).json(source);
    }

    // Case 3: Text
    if (body.type === 'text') {
      if (!body.content) {
        return res.status(400).json({ error: 'Content is required for type "text"' });
      }

      const extractedText = await cleanText(body.content);

      const source = await prisma.source.create({
        data: {
          botId,
          type: 'text',
          name: body.name || 'Pasted Text',
          content: extractedText,
          status: 'ready',
        },
      });

      await prisma.bot.update({ where: { id: botId as string }, data: { status: 'untrained' } });
      return res.status(201).json(source);
    }

    res.status(400).json({ error: 'Invalid source type' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Add source error:', error);
    res.status(500).json({ error: error.message || 'Failed to add source' });
  }
};

export const deleteSource = async (req: AuthRequest, res: Response) => {
  try {
    const { botId, sourceId } = req.params as { botId: string, sourceId: string };

    const source = await prisma.source.findUnique({
      where: { id: sourceId },
    });

    if (!source || source.botId !== botId) {
      return res.status(404).json({ error: 'Source not found' });
    }

    // deletion logic (cascades)
    await prisma.source.delete({
      where: { id: sourceId },
    });

    // Check if any sources left
    const remainingCount = await prisma.source.count({ where: { botId } });
    if (remainingCount === 0) {
      await prisma.bot.update({ where: { id: botId as string }, data: { status: 'untrained' } });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete source error:', error);
    res.status(500).json({ error: 'Failed to delete source' });
  }
};
