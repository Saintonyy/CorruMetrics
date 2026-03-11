import { useState, useMemo } from "react";
import { TopHeader } from "@/components/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Download, FileText, Printer } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import {
  mockProductionRecords,
  mockDowntimes,
  mockLines,
  mockShifts,
} from "@/lib/mock-data";
import {
  calcEfficiency,
  calcScrapPercentage,
  formatNumber,
  formatPercent,
  formatDuration,
} from "@/lib/metrics";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("production");
  const [dateStart, setDateStart] = useState("2026-02-24");
  const [dateEnd, setDateEnd] = useState("2026-03-11");
  const [lineFilter, setLineFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");

  const activeLines = mockLines.filter((l) => l.isActive);
  const lineMap = new Map(mockLines.map((l) => [l.id, l]));
  const shiftMap = new Map(mockShifts.map((s) => [s.id, s]));

  const filteredRecords = useMemo(() => {
    let records = mockProductionRecords.filter(
      (r) => r.productionDate >= dateStart && r.productionDate <= dateEnd
    );
    if (lineFilter !== "all") records = records.filter((r) => r.lineId === lineFilter);
    if (shiftFilter !== "all") records = records.filter((r) => r.shiftId === shiftFilter);
    return records;
  }, [dateStart, dateEnd, lineFilter, shiftFilter]);

  const filteredDowntimes = useMemo(() => {
    let dts = mockDowntimes.filter(
      (d) => d.startedAt.slice(0, 10) >= dateStart && d.startedAt.slice(0, 10) <= dateEnd
    );
    if (lineFilter !== "all") dts = dts.filter((d) => d.lineId === lineFilter);
    if (shiftFilter !== "all") dts = dts.filter((d) => d.shiftId === shiftFilter);
    return dts;
  }, [dateStart, dateEnd, lineFilter, shiftFilter]);

  const totalProduced = filteredRecords.reduce((s, r) => s + r.quantityProduced, 0);
  const totalScrap = filteredRecords.reduce((s, r) => s + r.scrapQuantity, 0);
  const totalDowntime = filteredDowntimes.reduce((s, d) => s + d.durationMinutes, 0);

  function handleExportCSV() {
    let csv = "";
    if (reportType === "production") {
      const headers = ["Fecha", "Linea", "Turno", "Orden", "Cantidad", "Runtime", "Merma"];
      const rows = filteredRecords.map((r) =>
        [
          r.productionDate,
          lineMap.get(r.lineId)?.name || "",
          shiftMap.get(r.shiftId)?.name || "",
          r.orderCode,
          r.quantityProduced,
          r.runtimeMinutes,
          r.scrapQuantity,
        ].join(",")
      );
      csv = [headers.join(","), ...rows].join("\n");
    } else {
      const headers = ["Inicio", "Duracion", "Linea", "Turno", "Categoria", "Causa"];
      const rows = filteredDowntimes.map((d) =>
        [
          d.startedAt,
          d.durationMinutes,
          lineMap.get(d.lineId)?.name || "",
          shiftMap.get(d.shiftId)?.name || "",
          d.category,
          d.cause,
        ].join(",")
      );
      csv = [headers.join(","), ...rows].join("\n");
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${reportType}-${dateStart}-${dateEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full">
      <TopHeader title="Reportes" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-2">
                <Label>Tipo de reporte</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-[180px]" data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Produccion</SelectItem>
                    <SelectItem value="downtime">Paros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  data-testid="input-report-start"
                />
              </div>

              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  data-testid="input-report-end"
                />
              </div>

              <Select value={lineFilter} onValueChange={setLineFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-report-line">
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
                <SelectTrigger className="w-[140px]" data-testid="select-report-shift">
                  <SelectValue placeholder="Turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {mockShifts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExportCSV} data-testid="button-export-report-csv">
                <Download className="w-4 h-4 mr-1" />
                Exportar CSV
              </Button>
              <Button variant="secondary" disabled data-testid="button-export-pdf">
                <FileText className="w-4 h-4 mr-1" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Total produccion" value={formatNumber(totalProduced)} />
          <KpiCard label="Merma" value={formatPercent(calcScrapPercentage(totalScrap, totalProduced))} />
          <KpiCard label="Tiempo muerto" value={formatDuration(totalDowntime)} />
        </div>

        {/* Preview Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Vista previa — {reportType === "production" ? "Produccion" : "Paros"} ({filteredRecords.length} registros)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {reportType === "production" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Linea</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Merma</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.slice(0, 50).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="tabular-nums">{r.productionDate}</TableCell>
                        <TableCell>{lineMap.get(r.lineId)?.name}</TableCell>
                        <TableCell>{shiftMap.get(r.shiftId)?.name}</TableCell>
                        <TableCell className="font-mono text-xs">{r.orderCode}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(r.quantityProduced)}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.scrapQuantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Linea</TableHead>
                      <TableHead>Duracion</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Causa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDowntimes.slice(0, 50).map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="tabular-nums text-xs">{d.startedAt.replace("T", " ")}</TableCell>
                        <TableCell>{lineMap.get(d.lineId)?.name}</TableCell>
                        <TableCell className="tabular-nums">{formatDuration(d.durationMinutes)}</TableCell>
                        <TableCell>{d.category}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{d.cause}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
