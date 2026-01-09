import {
  users, games, rentals, events, eventRegistrations,
  type User, type InsertUser,
  type Game, type InsertGame,
  type Rental, type InsertRental,
  type Event, type InsertEvent,
  type EventRegistration, type InsertEventRegistration,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  getAllGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<void>;
  
  getAllRentals(): Promise<(Rental & { user?: User; game?: Game })[]>;
  getRentalsByUser(userId: number): Promise<(Rental & { game?: Game })[]>;
  getRental(id: number): Promise<Rental | undefined>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRental(id: number, rental: Partial<InsertRental> & { status?: string }): Promise<Rental | undefined>;
  
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<void>;
  
  getAllEventRegistrations(): Promise<(EventRegistration & { user?: User; event?: Event })[]>;
  getEventRegistrationsByEvent(eventId: number): Promise<(EventRegistration & { user?: User })[]>;
  getEventRegistrationsByUser(userId: number): Promise<(EventRegistration & { event?: Event })[]>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: number, registration: Partial<InsertEventRegistration> & { status?: string }): Promise<EventRegistration | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user as any).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllGames(): Promise<Game[]> {
    return db.select().from(games).orderBy(desc(games.createdAt));
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined> {
    const [updated] = await db.update(games).set(game).where(eq(games.id, id)).returning();
    return updated || undefined;
  }

  async deleteGame(id: number): Promise<void> {
    await db.delete(rentals).where(eq(rentals.gameId, id));
    await db.delete(games).where(eq(games.id, id));
  }

  async getAllRentals(): Promise<(Rental & { user?: User; game?: Game })[]> {
    const allRentals = await db.select().from(rentals).orderBy(desc(rentals.createdAt));
    const result = [];
    for (const rental of allRentals) {
      const [user] = await db.select().from(users).where(eq(users.id, rental.userId));
      const [game] = await db.select().from(games).where(eq(games.id, rental.gameId));
      result.push({ ...rental, user, game });
    }
    return result;
  }

  async getRentalsByUser(userId: number): Promise<(Rental & { game?: Game })[]> {
    const userRentals = await db.select().from(rentals).where(eq(rentals.userId, userId)).orderBy(desc(rentals.createdAt));
    const result = [];
    for (const rental of userRentals) {
      const [game] = await db.select().from(games).where(eq(games.id, rental.gameId));
      result.push({ ...rental, game });
    }
    return result;
  }

  async getRental(id: number): Promise<Rental | undefined> {
    const [rental] = await db.select().from(rentals).where(eq(rentals.id, id));
    return rental || undefined;
  }

  async createRental(rental: InsertRental): Promise<Rental> {
    const [newRental] = await db.insert(rentals).values(rental).returning();
    await db.update(games).set({ available: false }).where(eq(games.id, rental.gameId));
    return newRental;
  }

  async updateRental(id: number, data: Partial<InsertRental> & { status?: string }): Promise<Rental | undefined> {
    const [updated] = await db.update(rentals).set(data).where(eq(rentals.id, id)).returning();
    if (updated && (data.status === "completed" || data.status === "cancelled")) {
      await db.update(games).set({ available: true }).where(eq(games.id, updated.gameId));
    }
    return updated || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.date));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updated] = await db.update(events).set(event).where(eq(events.id, id)).returning();
    return updated || undefined;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(eventRegistrations).where(eq(eventRegistrations.eventId, id));
    await db.delete(events).where(eq(events.id, id));
  }

  async getAllEventRegistrations(): Promise<(EventRegistration & { user?: User; event?: Event })[]> {
    const allRegs = await db.select().from(eventRegistrations).orderBy(desc(eventRegistrations.createdAt));
    const result = [];
    for (const reg of allRegs) {
      const [user] = await db.select().from(users).where(eq(users.id, reg.userId));
      const [event] = await db.select().from(events).where(eq(events.id, reg.eventId));
      result.push({ ...reg, user, event });
    }
    return result;
  }

  async getEventRegistrationsByEvent(eventId: number): Promise<(EventRegistration & { user?: User })[]> {
    const regs = await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId)).orderBy(desc(eventRegistrations.createdAt));
    const result = [];
    for (const reg of regs) {
      const [user] = await db.select().from(users).where(eq(users.id, reg.userId));
      result.push({ ...reg, user });
    }
    return result;
  }

  async getEventRegistrationsByUser(userId: number): Promise<(EventRegistration & { event?: Event })[]> {
    const regs = await db.select().from(eventRegistrations).where(eq(eventRegistrations.userId, userId)).orderBy(desc(eventRegistrations.createdAt));
    const result = [];
    for (const reg of regs) {
      const [event] = await db.select().from(events).where(eq(events.id, reg.eventId));
      result.push({ ...reg, event });
    }
    return result;
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newReg] = await db.insert(eventRegistrations).values(registration).returning();
    return newReg;
  }

  async updateEventRegistration(id: number, data: Partial<InsertEventRegistration> & { status?: string }): Promise<EventRegistration | undefined> {
    const [updated] = await db.update(eventRegistrations).set(data).where(eq(eventRegistrations.id, id)).returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
