import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { scores, users } from "@db/schema";
import { desc, eq, max, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post("/api/scores", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { score, difficulty } = req.body;
    if (typeof score !== "number") {
      return res.status(400).send("Invalid score");
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).send("Invalid difficulty");
    }

    const [newScore] = await db
      .insert(scores)
      .values({
        userId: req.user.id,
        score,
        difficulty,
      })
      .returning();

    res.json(newScore);
  });

  app.get("/api/scores", async (req, res) => {
    const { difficulty = 'medium' } = req.query;

    if (!['easy', 'medium', 'hard'].includes(difficulty as string)) {
      return res.status(400).send("Invalid difficulty");
    }

    const topScores = await db
      .select({
        id: scores.id,
        score: scores.score,
        userId: scores.userId,
        username: users.username,
        difficulty: scores.difficulty,
        createdAt: scores.createdAt,
      })
      .from(scores)
      .innerJoin(users, eq(scores.userId, users.id))
      .where(eq(scores.difficulty, difficulty as string))
      .orderBy(desc(scores.score))
      .limit(10);

    res.json(topScores);
  });

  app.get("/api/scores/highest", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { difficulty = 'medium' } = req.query;

    if (!['easy', 'medium', 'hard'].includes(difficulty as string)) {
      return res.status(400).send("Invalid difficulty");
    }

    const result = await db
      .select({
        highScore: max(scores.score),
      })
      .from(scores)
      .where(
        and(
          eq(scores.userId, req.user.id),
          eq(scores.difficulty, difficulty as string)
        )
      );

    const highScore = result[0]?.highScore || 0;
    res.json({ highScore });
  });

  app.post("/api/user/avatar", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { avatar } = req.body;
    if (typeof avatar !== "string") {
      return res.status(400).send("Invalid avatar style");
    }

    const [updatedUser] = await db
      .update(users)
      .set({ avatar })
      .where(eq(users.id, req.user.id))
      .returning();

    res.json(updatedUser);
  });

  const httpServer = createServer(app);
  return httpServer;
}