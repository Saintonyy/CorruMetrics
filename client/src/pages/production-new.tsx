import { useState } from "react";
import { useLocation } from "wouter";
import { TopHeader } from "@/components/top-header";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, ArrowLeft, CheckCircle } from "lucide-react";
import { mockPlants, mockLines, mockShifts, mockEmployees } from "@/lib/mock-data";

export default function ProductionNewPage() {
  const [, navigate] = useLocation();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    productionDate: new Date().toISOString().split("T")[0],
    plantId: mockPlants[0].id,
    lineId: "",
    shiftId: "",
    employeeId: "",
    orderCode: "",
    quantityProduced: "",
    runtimeMinutes: "",
    scrapQuantity: "",
    notes: "",
  });

  const activeLines = mockLines.filter((l) => l.isActive);
  const operators = mockEmployees.filter((e) => e.role === "operador" && e.isActive);

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST to /api/production
    setSuccess(true);
    setTimeout(() => navigate("/app/production"), 1500);
  }

  return (
    <div className="flex flex-col h-full">
      <TopHeader title="Nueva captura" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/production")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a produccion
          </Button>

          {success && (
            <Alert data-testid="alert-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Registro guardado correctamente</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registro de produccion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.productionDate}
                      onChange={(e) => handleChange("productionDate", e.target.value)}
                      required
                      data-testid="input-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Planta</Label>
                    <Select value={form.plantId} onValueChange={(v) => handleChange("plantId", v)}>
                      <SelectTrigger data-testid="select-plant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPlants.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Linea</Label>
                    <Select value={form.lineId} onValueChange={(v) => handleChange("lineId", v)} required>
                      <SelectTrigger data-testid="select-line">
                        <SelectValue placeholder="Seleccionar linea" />
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
                    <Select value={form.shiftId} onValueChange={(v) => handleChange("shiftId", v)} required>
                      <SelectTrigger data-testid="select-shift">
                        <SelectValue placeholder="Seleccionar turno" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockShifts.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operador</Label>
                    <Select value={form.employeeId} onValueChange={(v) => handleChange("employeeId", v)}>
                      <SelectTrigger data-testid="select-operator">
                        <SelectValue placeholder="Seleccionar operador" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Codigo de orden</Label>
                    <Input
                      id="order"
                      placeholder="ORD-1234"
                      value={form.orderCode}
                      onChange={(e) => handleChange("orderCode", e.target.value)}
                      required
                      data-testid="input-order"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qty">Cantidad producida</Label>
                    <Input
                      id="qty"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.quantityProduced}
                      onChange={(e) => handleChange("quantityProduced", e.target.value)}
                      required
                      data-testid="input-quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="runtime">Tiempo operacion (min)</Label>
                    <Input
                      id="runtime"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.runtimeMinutes}
                      onChange={(e) => handleChange("runtimeMinutes", e.target.value)}
                      required
                      data-testid="input-runtime"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scrap">Merma</Label>
                    <Input
                      id="scrap"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.scrapQuantity}
                      onChange={(e) => handleChange("scrapQuantity", e.target.value)}
                      data-testid="input-scrap"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observaciones</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notas adicionales..."
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
                    data-testid="input-notes"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" data-testid="button-save">
                    <Save className="w-4 h-4 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/app/production")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
