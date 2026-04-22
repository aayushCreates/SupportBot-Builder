import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import prisma from "./config/db";
import { verifyRedisConnection } from "./config/redis";
import { requireAuth } from "./middlewares/auth.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5050",
          ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Clerk Webhook
import { clerkWebhookHandler } from "./webhooks/clerk.webhook";
app.post("/webhooks/clerk", clerkWebhookHandler);

// Bot & Source Routes
import botRoutes from "./routes/bot.routes";
import sourceRoutes from "./routes/source.routes";
import chatRoutes from "./routes/chat.routes";
import widgetRoutes from "./routes/widget.routes";
import userRoutes from "./routes/user.routes";

app.use("/api/bots", requireAuth, botRoutes);
app.use("/api/user", requireAuth, userRoutes);
app.use("/api/bots/:botId/sources", requireAuth, sourceRoutes);

app.use("/api/chat", chatRoutes);
app.use("/api/widget", widgetRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

const startServer = async () => {
  try {
    console.log("Verifying database connection...");
    await prisma.$connect();
    console.log("Database connection successful ✅✅✅");

    console.log("Verifying Redis connection...");
    await verifyRedisConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀🚀🚀`);
    });
  } catch (error) {
    console.error("Failed to connect to the database ❌❌❌");
    console.error(error);
    process.exit(1);
  }
};

startServer();
