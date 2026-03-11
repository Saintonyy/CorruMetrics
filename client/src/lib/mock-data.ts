import type {
  Plant,
  Line,
  Shift,
  Employee,
  ProductionRecord,
  Downtime,
  Goal,
  AppUser,
} from "@shared/schema";

// ── Plants ──────────────────────────────────────────────────────────
export const mockPlants: Plant[] = [
  {
    id: "plant-1",
    name: "Planta Monterrey",
    location: "Monterrey, Nuevo Leon",
    timezone: "America/Mexico_City",
    currency: "MXN",
  },
];

// ── Lines ───────────────────────────────────────────────────────────
export const mockLines: Line[] = [
  { id: "line-1", plantId: "plant-1", name: "Linea A", nominalCapacity: 500, idealDailyOutput: 4500, isActive: true },
  { id: "line-2", plantId: "plant-1", name: "Linea B", nominalCapacity: 450, idealDailyOutput: 4000, isActive: true },
  { id: "line-3", plantId: "plant-1", name: "Linea C", nominalCapacity: 400, idealDailyOutput: 3500, isActive: true },
  { id: "line-4", plantId: "plant-1", name: "Linea D", nominalCapacity: 350, idealDailyOutput: 3000, isActive: false },
];

// ── Shifts ──────────────────────────────────────────────────────────
export const mockShifts: Shift[] = [
  { id: "shift-1", plantId: "plant-1", name: "Turno 1", startTime: "06:00", endTime: "14:00", isActive: true },
  { id: "shift-2", plantId: "plant-1", name: "Turno 2", startTime: "14:00", endTime: "22:00", isActive: true },
  { id: "shift-3", plantId: "plant-1", name: "Turno 3", startTime: "22:00", endTime: "06:00", isActive: true },
];

// ── Employees ───────────────────────────────────────────────────────
export const mockEmployees: Employee[] = [
  { id: "emp-1", plantId: "plant-1", fullName: "Carlos Ramirez", email: "carlos.r@corrumetrics.mx", role: "operador", lineId: "line-1", shiftId: "shift-1", isActive: true },
  { id: "emp-2", plantId: "plant-1", fullName: "Maria Lopez", email: "maria.l@corrumetrics.mx", role: "operador", lineId: "line-1", shiftId: "shift-2", isActive: true },
  { id: "emp-3", plantId: "plant-1", fullName: "Jorge Hernandez", email: "jorge.h@corrumetrics.mx", role: "operador", lineId: "line-2", shiftId: "shift-1", isActive: true },
  { id: "emp-4", plantId: "plant-1", fullName: "Ana Martinez", email: "ana.m@corrumetrics.mx", role: "supervisor", lineId: "line-2", shiftId: "shift-2", isActive: true },
  { id: "emp-5", plantId: "plant-1", fullName: "Roberto Gonzalez", email: "roberto.g@corrumetrics.mx", role: "operador", lineId: "line-3", shiftId: "shift-1", isActive: true },
  { id: "emp-6", plantId: "plant-1", fullName: "Sofia Torres", email: "sofia.t@corrumetrics.mx", role: "operador", lineId: "line-3", shiftId: "shift-3", isActive: true },
  { id: "emp-7", plantId: "plant-1", fullName: "Luis Garcia", email: "luis.g@corrumetrics.mx", role: "gerente", lineId: null, shiftId: null, isActive: true },
  { id: "emp-8", plantId: "plant-1", fullName: "Patricia Diaz", email: "patricia.d@corrumetrics.mx", role: "supervisor", lineId: "line-1", shiftId: "shift-3", isActive: true },
  { id: "emp-9", plantId: "plant-1", fullName: "Fernando Morales", email: "fernando.m@corrumetrics.mx", role: "operador", lineId: "line-2", shiftId: "shift-3", isActive: true },
  { id: "emp-10", plantId: "plant-1", fullName: "Isabel Ruiz", email: "isabel.r@corrumetrics.mx", role: "director", lineId: null, shiftId: null, isActive: true },
  { id: "emp-11", plantId: "plant-1", fullName: "Diego Salazar", email: "diego.s@corrumetrics.mx", role: "operador", lineId: "line-1", shiftId: "shift-2", isActive: false },
  { id: "emp-12", plantId: "plant-1", fullName: "Valentina Cruz", email: "valentina.c@corrumetrics.mx", role: "operador", lineId: "line-3", shiftId: "shift-2", isActive: true },
];

// ── Goals ────────────────────────────────────────────────────────────
export const mockGoals: Goal[] = [
  { id: "goal-1", plantId: "plant-1", lineId: "line-1", targetOutput: 4200, targetEfficiency: 95, idealEfficiency: 100 },
  { id: "goal-2", plantId: "plant-1", lineId: "line-2", targetOutput: 3800, targetEfficiency: 95, idealEfficiency: 100 },
  { id: "goal-3", plantId: "plant-1", lineId: "line-3", targetOutput: 3200, targetEfficiency: 92, idealEfficiency: 100 },
  { id: "goal-4", plantId: "plant-1", lineId: "line-4", targetOutput: 2800, targetEfficiency: 90, idealEfficiency: 100 },
];

// ── App Users ───────────────────────────────────────────────────────
export const mockAppUsers: AppUser[] = [
  { id: "user-1", plantId: "plant-1", fullName: "Admin Sistema", email: "admin@corrumetrics.mx", password: "admin123", role: "admin", isActive: true },
  { id: "user-2", plantId: "plant-1", fullName: "Luis Garcia", email: "luis.g@corrumetrics.mx", password: "gerente123", role: "gerente", isActive: true },
  { id: "user-3", plantId: "plant-1", fullName: "Ana Martinez", email: "ana.m@corrumetrics.mx", password: "super123", role: "supervisor", isActive: true },
  { id: "user-4", plantId: "plant-1", fullName: "Carlos Ramirez", email: "carlos.r@corrumetrics.mx", password: "oper123", role: "operador", isActive: true },
];

// ── Helper: generate date range ─────────────────────────────────────
function getDaysArray(start: Date, end: Date): string[] {
  const arr: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    arr.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return arr;
}

// Generate 30 days of data
const today = new Date("2026-03-11");
const thirtyDaysAgo = new Date("2026-02-09");
const days = getDaysArray(thirtyDaysAgo, today);

const activeLines = mockLines.filter((l) => l.isActive);
const operators = mockEmployees.filter((e) => e.role === "operador" && e.isActive);
const orderPrefixes = ["ORD", "PRD", "CJA"];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

let seedCounter = 42;
function rand(): number {
  return seededRandom(seedCounter++);
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// ── Production Records ──────────────────────────────────────────────
export const mockProductionRecords: ProductionRecord[] = [];
let prId = 1;

for (const day of days) {
  for (const line of activeLines) {
    for (const shift of mockShifts) {
      const matchingOps = operators.filter(
        (e) => e.lineId === line.id && e.shiftId === shift.id
      );
      const op = matchingOps.length > 0 ? matchingOps[0] : operators[randInt(0, operators.length - 1)];

      const baseQty = Math.round(line.idealDailyOutput / 3);
      const variance = rand() > 0.15 ? randInt(-200, 150) : randInt(-600, -200);
      const qty = Math.max(100, baseQty + variance);
      const runtime = randInt(400, 480);
      const scrap = rand() > 0.7 ? randInt(5, Math.round(qty * 0.08)) : randInt(0, Math.round(qty * 0.03));

      mockProductionRecords.push({
        id: `pr-${prId++}`,
        plantId: "plant-1",
        lineId: line.id,
        shiftId: shift.id,
        employeeId: op.id,
        productionDate: day,
        orderCode: `${orderPrefixes[randInt(0, 2)]}-${randInt(1000, 9999)}`,
        quantityProduced: qty,
        runtimeMinutes: runtime,
        scrapQuantity: scrap,
        notes: rand() > 0.8 ? "Ajuste de velocidad durante turno" : null,
      });
    }
  }
}

// ── Downtimes ───────────────────────────────────────────────────────
const downtimeCauses: Record<string, string[]> = {
  mecanico: ["Falla en rodamiento", "Banda rota", "Fuga hidraulica", "Desgaste de cuchillas"],
  electrico: ["Corto en motor", "Falla en PLC", "Sensor danado", "Sobrecarga electrica"],
  operativo: ["Error de operador", "Falta de material", "Cambio de turno extendido"],
  cambio_producto: ["Cambio de formato", "Ajuste de especificaciones", "Limpieza entre lotes"],
  mantenimiento_programado: ["Mantenimiento preventivo", "Lubricacion programada", "Calibracion"],
};

export const mockDowntimes: Downtime[] = [];
let dtId = 1;

for (const day of days) {
  const numDowntimes = randInt(1, 4);
  for (let i = 0; i < numDowntimes; i++) {
    const line = activeLines[randInt(0, activeLines.length - 1)];
    const shift = mockShifts[randInt(0, mockShifts.length - 1)];
    const categories = Object.keys(downtimeCauses);
    const cat = categories[randInt(0, categories.length - 1)];
    const causes = downtimeCauses[cat];
    const cause = causes[randInt(0, causes.length - 1)];
    const duration = cat === "mantenimiento_programado" ? randInt(30, 120) : randInt(5, 90);
    const startHour = randInt(6, 20);
    const startMin = randInt(0, 59);

    mockDowntimes.push({
      id: `dt-${dtId++}`,
      plantId: "plant-1",
      lineId: line.id,
      shiftId: shift.id,
      category: cat,
      cause,
      startedAt: `${day}T${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}:00`,
      endedAt: `${day}T${String(startHour).padStart(2, "0")}:${String(startMin + duration > 59 ? 59 : startMin + duration).padStart(2, "0")}:00`,
      durationMinutes: duration,
      notes: rand() > 0.7 ? "Requirio asistencia de mantenimiento" : null,
    });
  }
}
