import { boolean, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const personRecords = pgTable("person_records", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  surname: varchar("surname", { length: 255 }).notNull(),
  address: text("address").notNull(),
  cellNumber: varchar("cellNumber", { length: 20 }).notNull(),
  employed: boolean("employed").notNull(),
  hasBusiness: boolean("hasBusiness").notNull(),
  unemployed: boolean("unemployed").notNull().default(false),
  skills: text("skills").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PersonRecord = typeof personRecords.$inferSelect;
export type InsertPersonRecord = typeof personRecords.$inferInsert;
