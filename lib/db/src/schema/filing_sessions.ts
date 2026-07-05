import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { taxCalculationsTable } from "./tax_calculations";

export const filingSessionsTable = pgTable("filing_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  taxCalculationId: integer("tax_calculation_id").notNull().references(() => taxCalculationsTable.id),
  currentStep: integer("current_step").notNull().default(1),
  totalSteps: integer("total_steps").notNull().default(6),
  status: text("status").notNull().default("in_progress"),
  autoFillData: jsonb("auto_fill_data").notNull().$type<Record<string, unknown>>(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFilingSessionSchema = createInsertSchema(filingSessionsTable).omit({ id: true, createdAt: true });
export type InsertFilingSession = z.infer<typeof insertFilingSessionSchema>;
export type FilingSession = typeof filingSessionsTable.$inferSelect;
