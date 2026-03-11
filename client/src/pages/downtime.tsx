import { useState, useMemo } from "react";
import { TopHeader } from "@/components/top-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Plus, Clock, Hash, AlertTriangle } from "lucide-react";
import { mockDowntimes, mockLines, mockShifts } from "@/lib/mock-data";
import { formatDuration, formatNumber, calcDowntimeByCause } from "@/lib/metrics";
import { DOWNTIME_CATEGORIES } from "@shared/schema";

const CATEGORY_LABELS: Record<string, string> = {
  mecanico: "Mecanico",
  electrico: "Electrico",
  operativo: "Operativo",
  cambio_producto: "Cambio producto",
  mantenimiento_programado: "Mant. programado",
};

const CHART_COLORS = [
  "hsl(184 58% 35%)",
  "hsl(16 60% 42%)",
  "hsl(184 40% 25%)",
  "hsl(43 74% 49%)",
  "hsl(350 50% 45%)",
];

export default function DowntimePage() {
  const [lineFilter, setLineFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeLines = mockLines.filter((l) => l.isActive);
  const lineMap = new Map(mockLines.map((l) => [l.id, l]));
  const shiftMap = new Map(mockShifts.map((s) => [s.id, s]));

  const filtered = useMemo(() => {
    let items = [...mockDowntimes];
    if (lineFilter !== "all") items = items.filter((d) => d.lineId === lineFilter);
    if (shiftFilter !== "all") items = items.filter((d) => d.shiftId === shiftFilter);
    if (categoryFilter !== "all") items = items.filter((d) => d.category === categoryFilter);
    return items.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 100);
  }, [lineFilter, shiftFilter, categoryFilter]);

  const totalMinutes = filtered.reduce((s, d) => s + d.durationMinutes, 0);
  const causesData = calcDowntimeByCause(filtered);
  const topCause = causesData.length > 0 ? causesData[0] : null;

  return (
    <div className="flex flex-col h-full">
      <TopHeader title="Paros" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filters + Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={lineFilter} onValueChange={setLineFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-downtime-line">
                <SelectValue placeholder="Linea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {activeLines.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-downtime-shift">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {mockShifts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-downtime-category">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {DOWNTIME_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-downtime">
                <Plus className="w-4 h-4 mr-1" />
                Registrar paro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo registro de paro</DialogTitle>
              </DialogHeader>
              <DowntimeForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Tiempo muerto total"
            value={formatDuration(totalMinutes)}
            icon={Clock}
          />
          <KpiCard
            label="Total paros"
            value={formatNumber(filtered.length)}
            icon={Hash}
          />
          <KpiCard
            label="Causa principal"
            value={topCause ? CATEGORY_LABELS[topCause.category] || topCause.category : "—"}
            subtitle={topCause ? formatDuration(topCause.totalMinutes) : ""}
            icon={AlertTriangle}
          />
        </div>

        {/* Cause Chart + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Paros por causa</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={causesData.map((c) => ({
                        name: CATEGORY_LABELS[c.category] || c.category,
                        value: c.totalMinutes,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {causesData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v} min`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Distribucion por categoria</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={causesData.map((c) => ({
                      category: CATEGORY_LABELS[c.category] || c.category,
                      minutos: c.totalMinutes,
                      eventos: c.count,
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 8% 86%)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="minutos" name="Minutos" fill="hsl(184 58% 35%)" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Downtime Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Duracion</TableHead>
                    <TableHead>Linea</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Causa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id} data-testid={`row-downtime-${d.id}`}>
                      <TableCell className="tabular-nums text-xs">
                        {d.startedAt.replace("T", " ")}
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">
                        {formatDuration(d.durationMinutes)}
                      </TableCell>
                      <TableCell>{lineMap.get(d.lineId)?.name}</TableCell>
                      <TableCell>{shiftMap.get(d.shiftId)?.name}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {CATEGORY_LABELS[d.category] || d.category}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{d.cause}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DowntimeForm({ onClose }: { onClose: () => void }) {
  const activeLines = mockLines.filter((l) => l.isActive);
  const [form, setForm] = useState({
    lineId: "",
    shiftId: "",
    category: "",
    cause: "",
    startedAt: "",
    endedAt: "",
    notes: "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST to /api/downtimes
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Linea</Label>
          <Select value={form.lineId} onValueChange={(v) => handleChange("lineId", v)}>
            <SelectTrigger data-testid="form-downtime-line">
              <SelectValue placeholder="Linea" />
            </SelectTrigger>
            <SelectContent>
              {activeLines.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Turno</Label>
          <Select value={form.shiftId} onValueChange={(v) => handleChange("shiftId", v)}>
            <SelectTrigger data-testid="form-downtime-shift">
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent>
              {mockShifts.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
          <SelectTrigger data-testid="form-downtime-category">
            <SelectValue placeholder="Categoria de paro" />
          </SelectTrigger>
          <SelectContent>
            {DOWNTIME_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cause">Causa</Label>
        <Input
          id="cause"
          placeholder="Descripcion de la causa"
          value={form.cause}
          onChange={(e) => handleChange("cause", e.target.value)}
          required
          data-testid="input-downtime-cause"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="dt-start">Inicio</Label>
          <Input
            id="dt-start"
            type="datetime-local"
            value={form.startedAt}
            onChange={(e) => handleChange("startedAt", e.target.value)}
            required
            data-testid="input-downtime-start"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dt-end">Fin</Label>
          <Input
            id="dt-end"
            type="datetime-local"
            value={form.endedAt}
            onChange={(e) => handleChange("endedAt", e.target.value)}
            required
            data-testid="input-downtime-end"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dt-notes">Notas</Label>
        <Textarea
          id="dt-notes"
          placeholder="Observaciones..."
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={2}
          data-testid="input-downtime-notes"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" data-testid="button-save-downtime">Guardar</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}
