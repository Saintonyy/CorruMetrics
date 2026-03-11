import { useState, useMemo } from "react";
import { Link } from "wouter";
import { TopHeader } from "@/components/top-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Download, Gauge, Package, Clock, Trash2 } from "lucide-react";
import {
  mockProductionRecords,
  mockLines,
  mockShifts,
  mockEmployees,
} from "@/lib/mock-data";
import { formatNumber, formatPercent, calcEfficiency, calcScrapPercentage } from "@/lib/metrics";
import type { ProductionRecord } from "@shared/schema";

export default function ProductionPage() {
  const [lineFilter, setLineFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | null>(null);

  const activeLines = mockLines.filter((l) => l.isActive);
  const lineMap = new Map(mockLines.map((l) => [l.id, l]));
  const shiftMap = new Map(mockShifts.map((s) => [s.id, s]));
  const empMap = new Map(mockEmployees.map((e) => [e.id, e]));

  const filtered = useMemo(() => {
    let records = [...mockProductionRecords];
    if (lineFilter !== "all") records = records.filter((r) => r.lineId === lineFilter);
    if (shiftFilter !== "all") records = records.filter((r) => r.shiftId === shiftFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.orderCode.toLowerCase().includes(q) ||
          (r.employeeId && empMap.get(r.employeeId)?.fullName.toLowerCase().includes(q))
      );
    }
    return records.sort((a, b) => b.productionDate.localeCompare(a.productionDate)).slice(0, 100);
  }, [lineFilter, shiftFilter, searchQuery]);

  const totalProduced = filtered.reduce((s, r) => s + r.quantityProduced, 0);
  const totalScrap = filtered.reduce((s, r) => s + r.scrapQuantity, 0);
  const totalRuntime = filtered.reduce((s, r) => s + r.runtimeMinutes, 0);

  function handleExportCSV() {
    const headers = ["Fecha", "Linea", "Turno", "Orden", "Operador", "Cantidad", "Runtime", "Merma", "Eficiencia"];
    const rows = filtered.map((r) => {
      const line = lineMap.get(r.lineId);
      const idealOutput = line ? line.idealDailyOutput / 3 : 1;
      return [
        r.productionDate,
        line?.name || "",
        shiftMap.get(r.shiftId)?.name || "",
        r.orderCode,
        r.employeeId ? empMap.get(r.employeeId)?.fullName || "" : "",
        r.quantityProduced,
        r.runtimeMinutes,
        r.scrapQuantity,
        calcEfficiency(r.quantityProduced, idealOutput).toFixed(1) + "%",
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "produccion.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full">
      <TopHeader title="Produccion" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={lineFilter} onValueChange={setLineFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-line-filter">
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
              <SelectTrigger className="w-[140px]" data-testid="select-shift-filter">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {mockShifts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar orden u operador..."
              className="w-[220px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-production"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleExportCSV} data-testid="button-export-csv">
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Link href="/app/production/new">
              <Button data-testid="button-new-record">
                <Plus className="w-4 h-4 mr-1" />
                Nueva captura
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total produccion" value={formatNumber(totalProduced)} icon={Package} />
          <KpiCard label="Registros" value={formatNumber(filtered.length)} icon={Gauge} />
          <KpiCard label="Runtime total" value={`${Math.round(totalRuntime / 60)}h`} icon={Clock} />
          <KpiCard label="Merma" value={formatPercent(calcScrapPercentage(totalScrap, totalProduced))} icon={Trash2} />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Linea</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Runtime</TableHead>
                    <TableHead className="text-right">Merma</TableHead>
                    <TableHead className="text-right">Eficiencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const line = lineMap.get(r.lineId);
                    const idealOutput = line ? line.idealDailyOutput / 3 : 1;
                    const eff = calcEfficiency(r.quantityProduced, idealOutput);
                    return (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedRecord(r)}
                        data-testid={`row-production-${r.id}`}
                      >
                        <TableCell className="tabular-nums">{r.productionDate}</TableCell>
                        <TableCell>{line?.name}</TableCell>
                        <TableCell>{shiftMap.get(r.shiftId)?.name}</TableCell>
                        <TableCell className="font-mono text-xs">{r.orderCode}</TableCell>
                        <TableCell>{r.employeeId ? empMap.get(r.employeeId)?.fullName : "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(r.quantityProduced)}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.runtimeMinutes}m</TableCell>
                        <TableCell className="text-right tabular-nums">{r.scrapQuantity}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{formatPercent(eff)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <SheetContent data-testid="drawer-production-detail">
          <SheetHeader>
            <SheetTitle>Detalle de registro</SheetTitle>
          </SheetHeader>
          {selectedRecord && (
            <div className="space-y-4 pt-4">
              <DetailRow label="Fecha" value={selectedRecord.productionDate} />
              <DetailRow label="Linea" value={lineMap.get(selectedRecord.lineId)?.name || "—"} />
              <DetailRow label="Turno" value={shiftMap.get(selectedRecord.shiftId)?.name || "—"} />
              <DetailRow label="Orden" value={selectedRecord.orderCode} />
              <DetailRow
                label="Operador"
                value={selectedRecord.employeeId ? empMap.get(selectedRecord.employeeId)?.fullName || "—" : "—"}
              />
              <DetailRow label="Cantidad producida" value={formatNumber(selectedRecord.quantityProduced)} />
              <DetailRow label="Runtime" value={`${selectedRecord.runtimeMinutes} min`} />
              <DetailRow label="Merma" value={String(selectedRecord.scrapQuantity)} />
              <DetailRow label="Notas" value={selectedRecord.notes || "Sin observaciones"} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
