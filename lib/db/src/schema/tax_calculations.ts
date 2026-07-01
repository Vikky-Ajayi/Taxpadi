import { pgTable, serial, integer, text, timestamp, numeric, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { statementsTable } from "./statements";

export const taxCalculationsTable = pgTable("tax_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  statementId: integer("statement_id").notNull().references(() => statementsTable.id),
  taxYear: integer("tax_year").notNull(),
  grossIncome: numeric("gross_income", { precision: 15, scale: 2 }).notNull(),
  taxableIncome: numeric("taxable_income", { precision: 15, scale: 2 }).notNull(),
  personalRelief: numeric("personal_relief", { precision: 15, scale: 2 }).notNull(),
  taxLiability: numeric("tax_liability", { precision: 15, scale: 2 }).notNull(),
  effectiveRate: real("effective_rate").notNull(),
  bands: jsonb("bands").notNull().$type<Array<{ band: string; rate: number; taxableAmount: number; taxPayable: number }>>(),
  status: text("status").notNull().default("calculated"),
  plainEnglishSummary: text("plain_english_summary"),
  pidginSummary: text("pidgin_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaxCalculationSchema = createInsertSchema(taxCalculationsTable).omit({ id: true, createdAt: true });
export type InsertTaxCalculation = z.infer<typeof insertTaxCalculationSchema>;
export type TaxCalculation = typeof taxCalculationsTable.$inferSelect;
