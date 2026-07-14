import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const soundsTable = pgTable("sounds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  volume: integer("volume").notNull().default(80),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSoundSchema = createInsertSchema(soundsTable).omit({ id: true, createdAt: true });
export type InsertSound = z.infer<typeof insertSoundSchema>;
export type Sound = typeof soundsTable.$inferSelect;
