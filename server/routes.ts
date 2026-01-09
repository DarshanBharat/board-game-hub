import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./lib/email";
import bcrypt from "bcryptjs";
import {
  loginSchema,
  signupSchema,
  insertGameSchema,
  insertEventSchema,
  rentalRequestSchema,
  eventRegistrationRequestSchema,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export function registerRoutes(app: Express) {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
        role: "user",
      });
      
      // Send welcome email asynchronously
      sendWelcomeEmail(user.email, user.name).catch(err => {
        console.error("Welcome email background error:", err);
      });

      req.session.userId = user.id;
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.json(null);
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.json(null);
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, roomNo: user.roomNo });
  });

  app.get("/api/games", async (req, res) => {
    const games = await storage.getAllGames();
    res.json(games);
  });

  app.get("/api/games/:id", async (req, res) => {
    const game = await storage.getGame(parseInt(req.params.id));
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(game);
  });

  app.post("/api/games", requireAdmin, async (req, res) => {
    try {
      const data = insertGameSchema.parse(req.body);
      const game = await storage.createGame(data);
      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/games/:id", requireAdmin, async (req, res) => {
    try {
      const game = await storage.updateGame(parseInt(req.params.id), req.body);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/games/:id", requireAdmin, async (req, res) => {
    await storage.deleteGame(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/rentals", requireAdmin, async (req, res) => {
    const rentals = await storage.getAllRentals();
    res.json(rentals);
  });

  app.get("/api/rentals/my", requireAuth, async (req, res) => {
    const rentals = await storage.getRentalsByUser(req.session.userId!);
    res.json(rentals);
  });

  app.post("/api/rentals", requireAuth, async (req, res) => {
    try {
      const data = rentalRequestSchema.parse(req.body);
      const game = await storage.getGame(data.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      if (!game.available) {
        return res.status(400).json({ message: "Game is not available for rent" });
      }
      const rental = await storage.createRental({
        userId: req.session.userId!,
        gameId: data.gameId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "pending",
        paymentPhone: data.paymentPhone,
        paymentTime: new Date(data.paymentTime),
      });
      res.json(rental);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/rentals/:id", requireAdmin, async (req, res) => {
    try {
      const rental = await storage.updateRental(parseInt(req.params.id), req.body);
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }
      res.json(rental);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/rentals/:id/return-request", requireAuth, async (req, res) => {
    const rental = await storage.getRental(parseInt(req.params.id));
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }
    if (rental.userId !== req.session.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const updated = await storage.updateRental(rental.id, { status: "return_requested" });
    res.json(updated);
  });

  app.get("/api/events", async (req, res) => {
    const events = await storage.getAllEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  app.post("/api/events", requireAdmin, async (req, res) => {
    try {
      const data = insertEventSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
      });
      const event = await storage.createEvent(data);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const event = await storage.updateEvent(parseInt(req.params.id), req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/events/:id", requireAdmin, async (req, res) => {
    await storage.deleteEvent(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/events/:id/registrations", requireAdmin, async (req, res) => {
    const registrations = await storage.getEventRegistrationsByEvent(parseInt(req.params.id));
    res.json(registrations);
  });

  app.get("/api/registrations/my", requireAuth, async (req, res) => {
    const registrations = await storage.getEventRegistrationsByUser(req.session.userId!);
    res.json(registrations);
  });

  app.post("/api/registrations", requireAuth, async (req, res) => {
    try {
      const data = eventRegistrationRequestSchema.parse(req.body);
      const event = await storage.getEvent(data.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const registration = await storage.createEventRegistration({
        userId: req.session.userId!,
        eventId: data.eventId,
        status: "pending",
        paymentPhone: data.paymentPhone || null,
        paymentTime: data.paymentTime ? new Date(data.paymentTime) : null,
      });
      res.json(registration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/registrations/:id", requireAdmin, async (req, res) => {
    try {
      const registration = await storage.updateEventRegistration(parseInt(req.params.id), req.body);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      res.json(registration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/registrations", requireAdmin, async (req, res) => {
    const registrations = await storage.getAllEventRegistrations();
    res.json(registrations);
  });

  app.get("/api/users", requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ ...u, password: undefined })));
  });

  app.get("/api/users/:id", requireAdmin, async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const rentals = await storage.getRentalsByUser(user.id);
    const registrations = await storage.getEventRegistrationsByUser(user.id);
    res.json({ ...user, password: undefined, rentals, registrations });
  });
}
