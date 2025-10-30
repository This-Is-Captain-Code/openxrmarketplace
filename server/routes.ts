import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { privyId, walletAddress, email, phoneNumber } = req.body;
      
      if (!privyId) {
        return res.status(400).json({ error: "Privy ID is required" });
      }

      let user = await storage.getUserByPrivyId(privyId);
      
      if (!user) {
        const newUser = await storage.createUser({
          privyId,
          walletAddress: walletAddress || null,
          email: email || null,
          phoneNumber: phoneNumber || null,
        });
        user = newUser;
      } else {
        user = await storage.updateUser(user.id, {
          walletAddress: walletAddress || user.walletAddress,
          email: email || user.email,
          phoneNumber: phoneNumber || user.phoneNumber,
        });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const privyId = req.query.privyId as string;
      
      if (!privyId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUserByPrivyId(privyId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
