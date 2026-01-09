import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  roomNo: text("room_no").notNull(),
  password: text("password").notNull(),
  secretQuestion: text("secret_question").notNull(),
  secretAnswer: text("secret_answer").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  duration: text("duration").notNull(),
  complexity: text("complexity").notNull(),
  imageUrl: text("image_url"),
  rulesUrl: text("rules_url"),
  whatsInTheBox: json("whats_in_the_box").$type<string[]>().default([]),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rentals = pgTable("rentals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("pending"),
  paymentPhone: text("payment_phone"),
  paymentTime: timestamp("payment_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  price: integer("price").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  status: text("status").notNull().default("pending"),
  paymentPhone: text("payment_phone"),
  paymentTime: timestamp("payment_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  rentals: many(rentals),
  eventRegistrations: many(eventRegistrations),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  rentals: many(rentals),
}));

export const rentalsRelations = relations(rentals, ({ one }) => ({
  user: one(users, { fields: [rentals.userId], references: [users.id] }),
  game: one(games, { fields: [rentals.gameId], references: [games.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  user: one(users, { fields: [eventRegistrations.userId], references: [users.id] }),
  event: one(events, { fields: [eventRegistrations.eventId], references: [events.id] }),
}));

export const insertUserSchema = createInsertSchema(users, {
  secretQuestion: z.string().min(1),
  secretAnswer: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true 
});
export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertRentalSchema = createInsertSchema(rentals).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Rental = typeof rentals.$inferSelect;
export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  roomNo: z.string().min(1),
  password: z.string().min(6),
  secretQuestion: z.string().min(1),
  secretAnswer: z.string().min(1),
});

export const rentalRequestSchema = z.object({
  gameId: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  paymentPhone: z.string().min(10),
  paymentTime: z.string(),
});

export const eventRegistrationRequestSchema = z.object({
  eventId: z.number(),
  paymentPhone: z.string().optional(),
  paymentTime: z.string().optional(),
});
