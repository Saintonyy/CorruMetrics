import { TopHeader } from "@/components/top-header";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Gauge, Package, Clock, Trash2, TrendingUp, Target } from "lucide-react";
import {
  mockProductionRecords,
  mockDowntimes,
  mockLines,
  mockShifts,
  mockGoals,
} from "@/lib/mock-data";
import {
  calcDashboardKPIs,
  calcDailyEfficiency,
  calcProductionByLine,
  calcShiftComparison,
  calcLineSummary,
  calcTrend,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/metrics";

// Last 15 days as "current", prior 15 as "previous"
const sortedDates = [...new Set(mockProductionRecords.map((r) => r.productionDate))].sort();
const midIdx = Math.floor(sortedDates.length / 2);
const currentPeriodStart = sortedDates[midIdx];
const currentRecords = mockProductionRecords.filter((r) => r.productionDate >= currentPeriodStart);
const previousRecords = mockProductionRecords.filter((r) => r.productionDate < currentPeriodStart);
const currentDowntimes = mockDowntimes.filter((d) => d.startedAt >= currentPeriodStart);

const activeLines = mockLines.filter((l) => l.isActive);
const kpis = calcDashboardKPIs(currentRecords, currentDowntimes, activeLines);
const trend = calcTrend(currentRecords, previousRecords, activeLines);
kpis.trend = trend;

const dailyEfficiency = calcDailyEfficiency(currentRecords, activeLines);
const productionByLine = calcProductionByLine(currentRecords, activeLines, mockGoals);
const shiftComparison = calcShiftComparison(currentRecords, mockShifts, activeLines);
const lineSummary = calcLineSummary(currentRecords, currentDowntimes, activeLines, mockGoals);

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <TopHeader title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Eficiencia global"
            value={formatPercent(kpis.globalEfficiency)}
            icon={Gauge}
            trend={kpis.trend}
          />
          <KpiCard
            label="Produccion total"
            value={formatNumber(kpis.totalProduction)}
            subtitle="unidades periodo actual"
            icon={Package}
          />
          <KpiCard
            label="Tiempo muerto"
            value={formatDuration(kpis.totalDowntimeMinutes)}
            subtitle={`${currentDowntimes.length} eventos`}
            icon={Clock}
          />
          <KpiCard
            label="Merma"
            value={formatPercent(kpis.scrapPercentage)}
            subtitle="del total producido"
            icon={Trash2}
          />
        </div>

        {/* Status Summary */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <StatusBadge status={kpis.status} />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tendencia:</span>
                <span className={`text-sm font-semibold tabular-nums ${kpis.trend >= 0 ? "status-optimo" : "status-critico"}`}>
                  {kpis.trend >= 0 ? "+" : ""}{kpis.trend.toFixed(1)}% vs periodo anterior
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Meta:</span>
                <span className="text-sm font-semibold tabular-nums">95%</span>
                <span className="text-xs text-muted-foreground mx-1">|</span>
                <span className="text-sm text-muted-foreground">Ideal:</span>
                <span className="text-sm font-semibold tabular-nums">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Eficiencia por dia</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 8% 86%)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={[70, 105]}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v.toFixed(1)}%`, "Eficiencia"]}
                    labelFormatter={(l: string) => `Fecha: ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="hsl(184 80% 22%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Production by Line + Shift Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Produccion por linea</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productionByLine}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 8% 86%)" />
                    <XAxis dataKey="lineName" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="production" name="Produccion" fill="hsl(184 58% 35%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="target" name="Meta" fill="hsl(35 8% 78%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Comparativa turnos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 8% 86%)" />
                    <XAxis dataKey="shiftName" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgProduction" name="Produccion promedio" fill="hsl(16 60% 42%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Resumen por linea</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linea</TableHead>
                  <TableHead className="text-right">Produccion</TableHead>
                  <TableHead className="text-right">Meta</TableHead>
                  <TableHead className="text-right">Eficiencia</TableHead>
                  <TableHead className="text-right">Paros</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineSummary.map((row) => (
                  <TableRow key={row.lineId} data-testid={`row-summary-${row.lineId}`}>
                    <TableCell className="font-medium">{row.lineName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(row.production)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(row.target)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatPercent(row.efficiency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDuration(row.downtimeMinutes)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
