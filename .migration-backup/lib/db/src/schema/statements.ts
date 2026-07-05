import { pgTable, serial, integer, text, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const statementsTable = pgTable("statements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  periodFrom: date("period_from").notNull(),
  periodTo: date("period_to").notNull(),
  status: text("status").notNull().default("processing"),
  transactionCount: integer("transaction_count").notNull().default(0),
  totalCredits: numeric("total_credits", { precision: 15, scale: 2 }).notNull().default("0"),
  totalDebits: numeric("total_debits", { precision: 15, scale: 2 }).notNull().default("0"),
  rawData: text("raw_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStatementSchema = createInsertSchema(statementsTable).omit({ id: true, createdAt: true });
export type InsertStatement = z.infer<typeof insertStatementSchema>;
export type Statement = typeof statementsTable.$inferSelect;
