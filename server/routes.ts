import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ── Auth ────────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.getAppUserByEmail(email);
    if (!user || user.password !== password || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // ── Plants ──────────────────────────────────────────────────────
  app.get("/api/plants", async (_req, res) => {
    const plants = await storage.getPlants();
    res.json(plants);
  });

  app.put("/api/plants/:id", async (req, res) => {
    const updated = await storage.updatePlant(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  // ── Lines ───────────────────────────────────────────────────────
  app.get("/api/lines", async (req, res) => {
    const lines = await storage.getLines(req.query.plantId as string | undefined);
    res.json(lines);
  });

  app.post("/api/lines", async (req, res) => {
    const line = await storage.createLine(req.body);
    res.status(201).json(line);
  });

  // ── Shifts ──────────────────────────────────────────────────────
  app.get("/api/shifts", async (req, res) => {
    const shifts = await storage.getShifts(req.query.plantId as string | undefined);
    res.json(shifts);
  });

  app.post("/api/shifts", async (req, res) => {
    const shift = await storage.createShift(req.body);
    res.status(201).json(shift);
  });

  // ── Employees ───────────────────────────────────────────────────
  app.get("/api/employees", async (req, res) => {
    const employees = await storage.getEmployees(req.query.plantId as string | undefined);
    res.json(employees);
  });

  app.post("/api/employees", async (req, res) => {
    const emp = await storage.createEmployee(req.body);
    res.status(201).json(emp);
  });

  app.put("/api/employees/:id", async (req, res) => {
    const updated = await storage.updateEmployee(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  // ── Production ──────────────────────────────────────────────────
  app.get("/api/production", async (req, res) => {
    const records = await storage.getProductionRecords({
      plantId: req.query.plantId as string | undefined,
      lineId: req.query.lineId as string | undefined,
      shiftId: req.query.shiftId as string | undefined,
    });
    res.json(records);
  });

  app.post("/api/production", async (req, res) => {
    const record = await storage.createProductionRecord(req.body);
    res.status(201).json(record);
  });

  // ── Downtimes ───────────────────────────────────────────────────
  app.get("/api/downtimes", async (req, res) => {
    const downtimes = await storage.getDowntimes({
      plantId: req.query.plantId as string | undefined,
      lineId: req.query.lineId as string | undefined,
    });
    res.json(downtimes);
  });

  app.post("/api/downtimes", async (req, res) => {
    const dt = await storage.createDowntime(req.body);
    res.status(201).json(dt);
  });

  // ── Goals ───────────────────────────────────────────────────────
  app.get("/api/goals", async (req, res) => {
    const goals = await storage.getGoals(req.query.plantId as string | undefined);
    res.json(goals);
  });

  app.put("/api/goals/:id", async (req, res) => {
    const updated = await storage.updateGoal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  // ── App Users ───────────────────────────────────────────────────
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getAppUsers();
    res.json(users.map(({ password: _, ...u }) => u));
  });

  return httpServer;
}
