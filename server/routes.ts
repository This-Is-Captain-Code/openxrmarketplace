import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { PrivyClient } from "@privy-io/server-auth";

const PRIVY_APP_ID = process.env.VITE_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
  throw new Error("Missing PRIVY_APP_ID or PRIVY_APP_SECRET environment variables");
}

const privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

async function verifyPrivyToken(authToken: string) {
  try {
    const verifiedClaims = await privyClient.verifyAuthToken(authToken);
    return verifiedClaims;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const authToken = req.headers.authorization?.replace("Bearer ", "");
      
      if (!authToken) {
        return res.status(401).json({ error: "No authorization token provided" });
      }

      const verifiedClaims = await verifyPrivyToken(authToken);
      
      if (!verifiedClaims) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const privyId = verifiedClaims.userId;
      const { walletAddress, email, phoneNumber } = req.body;

      const parseResult = insertUserSchema.safeParse({
        privyId,
        walletAddress: walletAddress || null,
        email: email || null,
        phoneNumber: phoneNumber || null,
      });

      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: parseResult.error.errors 
        });
      }

      let user = await storage.getUserByPrivyId(privyId);
      
      if (!user) {
        user = await storage.createUser(parseResult.data);
      } else {
        const updated = await storage.updateUser(user.id, {
          walletAddress: walletAddress || user.walletAddress,
          email: email || user.email,
          phoneNumber: phoneNumber || user.phoneNumber,
        });
        if (updated) user = updated;
      }

      return res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const authToken = req.headers.authorization?.replace("Bearer ", "");
      
      if (!authToken) {
        return res.status(401).json({ error: "No authorization token provided" });
      }

      const verifiedClaims = await verifyPrivyToken(authToken);
      
      if (!verifiedClaims) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const user = await storage.getUserByPrivyId(verifiedClaims.userId);
      
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
