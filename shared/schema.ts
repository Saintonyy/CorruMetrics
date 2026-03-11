import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Plants ──────────────────────────────────────────────────────────
export const plants = pgTable("plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  timezone: text("timezone").notNull().default("America/Mexico_City"),
  currency: text("currency").notNull().default("MXN"),
});

export const insertPlantSchema = createInsertSchema(plants).omit({ id: true });
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;

// ── Lines ───────────────────────────────────────────────────────────
export const lines = pgTable("lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull(),
  name: text("name").notNull(),
  nominalCapacity: integer("nominal_capacity").notNull(),
  idealDailyOutput: integer("ideal_daily_output").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertLineSchema = createInsertSchema(lines).omit({ id: true });
export type InsertLine = z.infer<typeof insertLineSchema>;
export type Line = typeof lines.$inferSelect;

// ── Shifts ──────────────────────────────────────────────────────────
export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull(),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertShiftSchema = createInsertSchema(shifts).omit({ id: true });
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;

// ── Employees ───────────────────────────────────────────────────────
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // operador | supervisor | gerente | director | admin
  lineId: varchar("line_id"),
  shiftId: varchar("shift_id"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// ── Production Records ──────────────────────────────────────────────
export const productionRecords = pgTable("production_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull(),
  lineId: varchar("line_id").notNull(),
  shiftId: varchar("shift_id").notNull(),
  employeeId: varchar("employee_id"),
  productionDate: text("production_date").notNull(), // ISO date string
  orderCode: text("order_code").notNull(),
  quantityProduced: integer("quantity_produced").notNull(),
  runtimeMinutes: integer("runtime_minutes").notNull(),
  scrapQuantity: integer("scrap_quantity").notNull().default(0),
  notes: text("notes"),
});

export const insertProductionRecordSchema = createInsertSchema(productionRecords).omit({ id: true });
export type InsertProductionRecord = z.infer<typeof insertProductionRecordSchema>;
export type ProductionRecord = typeof productionRecords.$inferSelect;

// ── Downtimes ───────────────────────────────────────────────────────
export const downtimes = pgTable("downtimes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull(),
  lineId: varchar("line_id").notNull(),
  shiftId: varchar("shift_id").notNull(),
  category: text("category").notNull(), // mecánico | eléctrico | operativo | cambio_producto | mantenimiento_programado
  cause: text("cause").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  notes: text("notes"),
});

export const insertDowntimeSchema = createInsertSchema(downtimes).omit({ id: true });
export type InsertDowntime = z.infer<typeof insertDowntimeSchema>;
export type Downtime = typeof downtimes.$inferSelect;

// ── Goals ───────────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull(),
  lineId: varchar("line_id").notNull(),
  targetOutput: integer("target_output").notNull(),
  targetEfficiency: real("target_efficiency").notNull(), // e.g. 95.0
  idealEfficiency: real("ideal_efficiency").notNull().default(100),
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// ── App Users (auth) ────────────────────────────────────────────────
export const appUsers = pgTable("app_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operador"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertAppUserSchema = createInsertSchema(appUsers).omit({ id: true });
export type InsertAppUser = z.infer<typeof insertAppUserSchema>;
export type AppUser = typeof appUsers.$inferSelect;

// ── Derived types for frontend ──────────────────────────────────────
export type EfficiencyStatus = "optimo" | "estable" | "riesgo" | "critico";

export function classifyEfficiency(efficiency: number): EfficiencyStatus {
  if (efficiency >= 95) return "optimo";
  if (efficiency >= 90) return "estable";
  if (efficiency >= 80) return "riesgo";
  return "critico";
}

export const DOWNTIME_CATEGORIES = [
  "mecanico",
  "electrico",
  "operativo",
  "cambio_producto",
  "mantenimiento_programado",
] as const;

export const EMPLOYEE_ROLES = [
  "operador",
  "supervisor",
  "gerente",
  "director",
  "admin",
] as const;
