import {
  type Plant, type InsertPlant,
  type Line, type InsertLine,
  type Shift, type InsertShift,
  type Employee, type InsertEmployee,
  type ProductionRecord, type InsertProductionRecord,
  type Downtime, type InsertDowntime,
  type Goal, type InsertGoal,
  type AppUser, type InsertAppUser,
} from "@shared/schema";
import { randomUUID } from "crypto";

// ── Storage interface ───────────────────────────────────────────────
// TODO: Replace with Supabase/Postgres via Drizzle ORM

export interface IStorage {
  // Auth
  getAppUserByEmail(email: string): Promise<AppUser | undefined>;
  getAppUsers(): Promise<AppUser[]>;
  createAppUser(user: InsertAppUser): Promise<AppUser>;

  // Plants
  getPlants(): Promise<Plant[]>;
  updatePlant(id: string, data: Partial<InsertPlant>): Promise<Plant | undefined>;

  // Lines
  getLines(plantId?: string): Promise<Line[]>;
  createLine(line: InsertLine): Promise<Line>;
  updateLine(id: string, data: Partial<InsertLine>): Promise<Line | undefined>;

  // Shifts
  getShifts(plantId?: string): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;

  // Employees
  getEmployees(plantId?: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee | undefined>;

  // Production
  getProductionRecords(filters?: { plantId?: string; lineId?: string; shiftId?: string }): Promise<ProductionRecord[]>;
  createProductionRecord(record: InsertProductionRecord): Promise<ProductionRecord>;

  // Downtimes
  getDowntimes(filters?: { plantId?: string; lineId?: string }): Promise<Downtime[]>;
  createDowntime(downtime: InsertDowntime): Promise<Downtime>;

  // Goals
  getGoals(plantId?: string): Promise<Goal[]>;
  updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined>;
}

// ── In-memory implementation ────────────────────────────────────────

export class MemStorage implements IStorage {
  private plants = new Map<string, Plant>();
  private lines = new Map<string, Line>();
  private shifts = new Map<string, Shift>();
  private employees = new Map<string, Employee>();
  private productionRecords = new Map<string, ProductionRecord>();
  private downtimes = new Map<string, Downtime>();
  private goals = new Map<string, Goal>();
  private appUsers = new Map<string, AppUser>();

  // Auth
  async getAppUserByEmail(email: string) {
    return Array.from(this.appUsers.values()).find((u) => u.email === email);
  }
  async getAppUsers() { return Array.from(this.appUsers.values()); }
  async createAppUser(data: InsertAppUser) {
    const id = randomUUID();
    const user: AppUser = { ...data, id };
    this.appUsers.set(id, user);
    return user;
  }

  // Plants
  async getPlants() { return Array.from(this.plants.values()); }
  async updatePlant(id: string, data: Partial<InsertPlant>) {
    const plant = this.plants.get(id);
    if (!plant) return undefined;
    const updated = { ...plant, ...data };
    this.plants.set(id, updated);
    return updated;
  }

  // Lines
  async getLines(plantId?: string) {
    const all = Array.from(this.lines.values());
    return plantId ? all.filter((l) => l.plantId === plantId) : all;
  }
  async createLine(data: InsertLine) {
    const id = randomUUID();
    const line: Line = { id, ...data, isActive: data.isActive ?? true };
    this.lines.set(id, line);
    return line;
  }
  async updateLine(id: string, data: Partial<InsertLine>) {
    const line = this.lines.get(id);
    if (!line) return undefined;
    const updated = { ...line, ...data };
    this.lines.set(id, updated);
    return updated;
  }

  // Shifts
  async getShifts(plantId?: string) {
    const all = Array.from(this.shifts.values());
    return plantId ? all.filter((s) => s.plantId === plantId) : all;
  }
  async createShift(data: InsertShift) {
    const id = randomUUID();
    const shift: Shift = { id, ...data, isActive: data.isActive ?? true };
    this.shifts.set(id, shift);
    return shift;
  }

  // Employees
  async getEmployees(plantId?: string) {
    const all = Array.from(this.employees.values());
    return plantId ? all.filter((e) => e.plantId === plantId) : all;
  }
  async createEmployee(data: InsertEmployee) {
    const id = randomUUID();
    const emp: Employee = { id, ...data, isActive: data.isActive ?? true };
    this.employees.set(id, emp);
    return emp;
  }
  async updateEmployee(id: string, data: Partial<InsertEmployee>) {
    const emp = this.employees.get(id);
    if (!emp) return undefined;
    const updated = { ...emp, ...data };
    this.employees.set(id, updated);
    return updated;
  }

  // Production
  async getProductionRecords(filters?: { plantId?: string; lineId?: string; shiftId?: string }) {
    let all = Array.from(this.productionRecords.values());
    if (filters?.plantId) all = all.filter((r) => r.plantId === filters.plantId);
    if (filters?.lineId) all = all.filter((r) => r.lineId === filters.lineId);
    if (filters?.shiftId) all = all.filter((r) => r.shiftId === filters.shiftId);
    return all;
  }
  async createProductionRecord(data: InsertProductionRecord) {
    const id = randomUUID();
    const record: ProductionRecord = { id, ...data, scrapQuantity: data.scrapQuantity ?? 0 };
    this.productionRecords.set(id, record);
    return record;
  }

  // Downtimes
  async getDowntimes(filters?: { plantId?: string; lineId?: string }) {
    let all = Array.from(this.downtimes.values());
    if (filters?.plantId) all = all.filter((d) => d.plantId === filters.plantId);
    if (filters?.lineId) all = all.filter((d) => d.lineId === filters.lineId);
    return all;
  }
  async createDowntime(data: InsertDowntime) {
    const id = randomUUID();
    const dt: Downtime = { id, ...data };
    this.downtimes.set(id, dt);
    return dt;
  }

  // Goals
  async getGoals(plantId?: string) {
    const all = Array.from(this.goals.values());
    return plantId ? all.filter((g) => g.plantId === plantId) : all;
  }
  async updateGoal(id: string, data: Partial<InsertGoal>) {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    const updated = { ...goal, ...data };
    this.goals.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
