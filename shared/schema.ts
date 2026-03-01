import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  roomNo: text("room_no").notNull(),
  password: text("password").notNull(),
  secretQuestion: text("secret_question").notNull(),
  secretAnswer: text("secret_answer").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  duration: text("duration").notNull(),
  complexity: text("complexity").notNull(),
  imageUrl: text("image_url"),
  rulesUrl: text("rules_url"),
  videoRulesUrl: text("video_rules_url"),
  whatsInTheBox: text("whats_in_the_box", { mode: "json" }).$type<string[]>().default([]),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const rentals = sqliteTable("rentals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentPhone: text("payment_phone"),
  paymentTime: integer("payment_time", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  price: integer("price").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const eventRegistrations = sqliteTable("event_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  status: text("status").notNull().default("pending"),
  attended: integer("attended", { mode: "boolean" }).notNull().default(false),
  paymentPhone: text("payment_phone"),
  paymentTime: integer("payment_time", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
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

export type User = typeof users.$inferSelect;
export type InsertUser = Omit<User, 'id' | 'createdAt'>;
export type Game = typeof games.$inferSelect;
export type InsertGame = Omit<Game, 'id' | 'createdAt'>;
export type Rental = typeof rentals.$inferSelect;
export type InsertRental = Omit<Rental, 'id' | 'createdAt'>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = Omit<Event, 'id' | 'createdAt'>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = Omit<EventRegistration, 'id' | 'createdAt'>;

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

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'payment_approved', 'payment_rejected', 'rental_reminder', 'rental_overdue', 'event_reminder', 'admin_alert'
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  relatedId: integer("related_id"), // ID of rental or event
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = Omit<Notification, 'id' | 'createdAt'>;
