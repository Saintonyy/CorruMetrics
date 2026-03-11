import type { ProductionRecord, Downtime, Line, EfficiencyStatus } from "@shared/schema";
import { classifyEfficiency } from "@shared/schema";

// ── KPI Calculations ────────────────────────────────────────────────

export function calcEfficiency(
  totalProduced: number,
  totalIdealCapacity: number
): number {
  if (totalIdealCapacity === 0) return 0;
  return (totalProduced / totalIdealCapacity) * 100;
}

export function calcScrapPercentage(
  totalScrap: number,
  totalProduced: number
): number {
  if (totalProduced === 0) return 0;
  return (totalScrap / totalProduced) * 100;
}

export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("es-MX");
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

// ── Dashboard Summary ───────────────────────────────────────────────

export interface DashboardKPIs {
  globalEfficiency: number;
  totalProduction: number;
  totalDowntimeMinutes: number;
  scrapPercentage: number;
  status: EfficiencyStatus;
  trend: number; // percentage change vs previous period
  targetEfficiency: number;
}

export function calcDashboardKPIs(
  records: ProductionRecord[],
  downtimes: Downtime[],
  lines: Line[],
  targetEfficiency: number = 95
): DashboardKPIs {
  const totalProduced = records.reduce((s, r) => s + r.quantityProduced, 0);
  const totalScrap = records.reduce((s, r) => s + r.scrapQuantity, 0);
  const totalDowntimeMinutes = downtimes.reduce((s, d) => s + d.durationMinutes, 0);

  // Calculate ideal capacity based on records per line
  const lineMap = new Map(lines.map((l) => [l.id, l]));
  let totalIdealCapacity = 0;

  // Group records by line and count unique dates to estimate ideal capacity
  const lineRecordCounts = new Map<string, Set<string>>();
  for (const r of records) {
    if (!lineRecordCounts.has(r.lineId)) {
      lineRecordCounts.set(r.lineId, new Set());
    }
    lineRecordCounts.get(r.lineId)!.add(r.productionDate);
  }

  for (const [lineId, dates] of lineRecordCounts) {
    const line = lineMap.get(lineId);
    if (line) {
      totalIdealCapacity += line.idealDailyOutput * dates.size;
    }
  }

  const globalEfficiency = calcEfficiency(totalProduced, totalIdealCapacity);
  const scrapPercentage = calcScrapPercentage(totalScrap, totalProduced);

  return {
    globalEfficiency,
    totalProduction: totalProduced,
    totalDowntimeMinutes,
    scrapPercentage,
    status: classifyEfficiency(globalEfficiency),
    trend: 0, // computed separately with period comparison
    targetEfficiency,
  };
}

// ── Period comparison ───────────────────────────────────────────────

export function calcTrend(
  currentRecords: ProductionRecord[],
  previousRecords: ProductionRecord[],
  lines: Line[]
): number {
  const lineMap = new Map(lines.map((l) => [l.id, l]));

  const calcPeriodEff = (records: ProductionRecord[]) => {
    const produced = records.reduce((s, r) => s + r.quantityProduced, 0);
    const lineRecordCounts = new Map<string, Set<string>>();
    for (const r of records) {
      if (!lineRecordCounts.has(r.lineId)) lineRecordCounts.set(r.lineId, new Set());
      lineRecordCounts.get(r.lineId)!.add(r.productionDate);
    }
    let ideal = 0;
    for (const [lineId, dates] of lineRecordCounts) {
      const line = lineMap.get(lineId);
      if (line) ideal += line.idealDailyOutput * dates.size;
    }
    return calcEfficiency(produced, ideal);
  };

  const current = calcPeriodEff(currentRecords);
  const previous = calcPeriodEff(previousRecords);

  if (previous === 0) return 0;
  return current - previous;
}

// ── Daily efficiency trend ──────────────────────────────────────────

export interface DailyEfficiency {
  date: string;
  efficiency: number;
}

export function calcDailyEfficiency(
  records: ProductionRecord[],
  lines: Line[]
): DailyEfficiency[] {
  const lineMap = new Map(lines.map((l) => [l.id, l]));
  const byDate = new Map<string, ProductionRecord[]>();

  for (const r of records) {
    if (!byDate.has(r.productionDate)) byDate.set(r.productionDate, []);
    byDate.get(r.productionDate)!.push(r);
  }

  const result: DailyEfficiency[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const date of sortedDates) {
    const dayRecords = byDate.get(date)!;
    const produced = dayRecords.reduce((s, r) => s + r.quantityProduced, 0);
    const uniqueLines = new Set(dayRecords.map((r) => r.lineId));
    let ideal = 0;
    for (const lineId of uniqueLines) {
      const line = lineMap.get(lineId);
      if (line) ideal += line.idealDailyOutput;
    }
    result.push({ date, efficiency: calcEfficiency(produced, ideal) });
  }

  return result;
}

// ── Production by line ──────────────────────────────────────────────

export interface LineProduction {
  lineName: string;
  lineId: string;
  production: number;
  target: number;
}

export function calcProductionByLine(
  records: ProductionRecord[],
  lines: Line[],
  goals: { lineId: string; targetOutput: number }[]
): LineProduction[] {
  const lineMap = new Map(lines.map((l) => [l.id, l]));
  const goalMap = new Map(goals.map((g) => [g.lineId, g.targetOutput]));
  const byLine = new Map<string, number>();

  for (const r of records) {
    byLine.set(r.lineId, (byLine.get(r.lineId) || 0) + r.quantityProduced);
  }

  return Array.from(byLine.entries()).map(([lineId, production]) => ({
    lineName: lineMap.get(lineId)?.name || lineId,
    lineId,
    production,
    target: goalMap.get(lineId) || 0,
  }));
}

// ── Shift comparison ────────────────────────────────────────────────

export interface ShiftComparison {
  shiftName: string;
  shiftId: string;
  avgProduction: number;
  avgEfficiency: number;
}

export function calcShiftComparison(
  records: ProductionRecord[],
  shifts: { id: string; name: string }[],
  lines: Line[]
): ShiftComparison[] {
  const lineMap = new Map(lines.map((l) => [l.id, l]));
  const shiftMap = new Map(shifts.map((s) => [s.id, s.name]));
  const byShift = new Map<string, ProductionRecord[]>();

  for (const r of records) {
    if (!byShift.has(r.shiftId)) byShift.set(r.shiftId, []);
    byShift.get(r.shiftId)!.push(r);
  }

  return Array.from(byShift.entries()).map(([shiftId, recs]) => {
    const totalProduced = recs.reduce((s, r) => s + r.quantityProduced, 0);
    const uniqueDays = new Set(recs.map((r) => r.productionDate)).size;
    const avgProduction = uniqueDays > 0 ? Math.round(totalProduced / uniqueDays) : 0;

    let totalIdeal = 0;
    const lineRecordCounts = new Map<string, Set<string>>();
    for (const r of recs) {
      if (!lineRecordCounts.has(r.lineId)) lineRecordCounts.set(r.lineId, new Set());
      lineRecordCounts.get(r.lineId)!.add(r.productionDate);
    }
    for (const [lineId, dates] of lineRecordCounts) {
      const line = lineMap.get(lineId);
      if (line) totalIdeal += line.idealDailyOutput * dates.size;
    }

    return {
      shiftName: shiftMap.get(shiftId) || shiftId,
      shiftId,
      avgProduction,
      avgEfficiency: calcEfficiency(totalProduced, totalIdeal),
    };
  });
}

// ── Line summary table ──────────────────────────────────────────────

export interface LineSummary {
  lineId: string;
  lineName: string;
  production: number;
  target: number;
  efficiency: number;
  downtimeMinutes: number;
  status: EfficiencyStatus;
}

export function calcLineSummary(
  records: ProductionRecord[],
  downtimes: Downtime[],
  lines: Line[],
  goals: { lineId: string; targetOutput: number }[]
): LineSummary[] {
  const lineMap = new Map(lines.map((l) => [l.id, l]));
  const goalMap = new Map(goals.map((g) => [g.lineId, g.targetOutput]));

  const byLine = new Map<string, { records: ProductionRecord[]; downtimes: Downtime[] }>();

  for (const line of lines.filter((l) => l.isActive)) {
    byLine.set(line.id, { records: [], downtimes: [] });
  }

  for (const r of records) {
    byLine.get(r.lineId)?.records.push(r);
  }
  for (const d of downtimes) {
    byLine.get(d.lineId)?.downtimes.push(d);
  }

  return Array.from(byLine.entries()).map(([lineId, data]) => {
    const line = lineMap.get(lineId)!;
    const production = data.records.reduce((s, r) => s + r.quantityProduced, 0);
    const uniqueDays = new Set(data.records.map((r) => r.productionDate)).size;
    const idealTotal = line.idealDailyOutput * Math.max(uniqueDays, 1);
    const efficiency = calcEfficiency(production, idealTotal);
    const downtimeMinutes = data.downtimes.reduce((s, d) => s + d.durationMinutes, 0);
    const target = goalMap.get(lineId) || 0;

    return {
      lineId,
      lineName: line.name,
      production,
      target: target * Math.max(uniqueDays, 1),
      efficiency,
      downtimeMinutes,
      status: classifyEfficiency(efficiency),
    };
  });
}

// ── Downtime by cause ───────────────────────────────────────────────

export interface DowntimeByCause {
  category: string;
  totalMinutes: number;
  count: number;
}

export function calcDowntimeByCause(downtimes: Downtime[]): DowntimeByCause[] {
  const byCause = new Map<string, { totalMinutes: number; count: number }>();

  for (const d of downtimes) {
    const existing = byCause.get(d.category) || { totalMinutes: 0, count: 0 };
    existing.totalMinutes += d.durationMinutes;
    existing.count += 1;
    byCause.set(d.category, existing);
  }

  return Array.from(byCause.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}
