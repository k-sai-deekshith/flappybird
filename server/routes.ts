import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { scores, users } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post("/api/scores", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { score } = req.body;
    if (typeof score !== "number") {
      return res.status(400).send("Invalid score");
    }

    const [newScore] = await db
      .insert(scores)
      .values({
        userId: req.user.id,
        score,
      })
      .returning();

    res.json(newScore);
  });

  app.get("/api/scores", async (_req, res) => {
    const topScores = await db
      .select({
        id: scores.id,
        score: scores.score,
        userId: scores.userId,
        username: users.username,
        createdAt: scores.createdAt,
      })
      .from(scores)
      .innerJoin(users, eq(scores.userId, users.id))
      .orderBy(desc(scores.score))
      .limit(10);

    res.json(topScores);
  });

  const httpServer = createServer(app);
  return httpServer;
}