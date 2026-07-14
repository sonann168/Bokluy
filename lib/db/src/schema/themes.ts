import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const themesTable = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  primaryColor: text("primary_color").notNull().default("#7B2EFF"),
  secondaryColor: text("secondary_color").notNull().default("#FFB100"),
  accentColor: text("accent_color").notNull().default("#FF5A36"),
  highlightColor: text("highlight_color").notNull().default("#45B7FF"),
  backgroundColor: text("background_color").notNull().default("#0D0118"),
  surfaceColor: text("surface_color").notNull().default("#1A0533"),
  textColor: text("text_color").notNull().default("#FFFFFF"),
  fontHeading: text("font_heading").notNull().default("Rajdhani"),
  fontBody: text("font_body").notNull().default("Inter"),
  borderRadius: text("border_radius").notNull().default("0.75rem"),
  customCss: text("custom_css"),
  preview: jsonb("preview"),
  isActive: boolean("is_active").notNull().default(false),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertThemeSchema = createInsertSchema(themesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themesTable.$inferSelect;
