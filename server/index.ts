import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Auth routes
  app.use("/api/auth", authRoutes);

  // Error handler for API routes only
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Only handle errors for API routes
    if (req.path.startsWith('/api/')) {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Pass non-API routes to Vite
      next(err);
    }
  });

  return app;
}
