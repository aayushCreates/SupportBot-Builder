import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Public health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clerk Webhook
import { clerkWebhookHandler } from './webhooks/clerk.webhook';
app.post('/webhooks/clerk', clerkWebhookHandler);

// Bot & Source Routes
import botRoutes from './routes/bot.routes';
import sourceRoutes from './routes/source.routes';
import chatRoutes from './routes/chat.routes';
import widgetRoutes from './routes/widget.routes';

app.use('/api/bots', ClerkExpressWithAuth() as any, botRoutes);
app.use('/api/bots/:botId/sources', ClerkExpressWithAuth() as any, sourceRoutes);

app.use('/api/chat', chatRoutes);
app.use('/api/widget', widgetRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
