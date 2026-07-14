import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  streamerName: text("streamer_name").notNull().default("IMUZAKI"),
  streamerBio: text("streamer_bio"),
  currency: text("currency").notNull().default("USD"),
  minDonationAmount: numeric("min_donation_amount", { precision: 10, scale: 2 }).notNull().default("1"),
  alertDuration: integer("alert_duration").notNull().default(8),
  theme: text("theme").notNull().default("purple"),
  overlayAlertEnabled: boolean("overlay_alert_enabled").notNull().default(true),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  activeSoundId: integer("active_sound_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
