import { useState } from "react";
import { TopHeader } from "@/components/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save } from "lucide-react";
import {
  mockPlants,
  mockLines,
  mockShifts,
  mockGoals,
  mockAppUsers,
} from "@/lib/mock-data";
import { formatPercent } from "@/lib/metrics";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("plant");

  return (
    <div className="flex flex-col h-full">
      <TopHeader title="Configuracion" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-settings">
            <TabsTrigger value="plant" data-testid="tab-plant">Planta</TabsTrigger>
            <TabsTrigger value="lines" data-testid="tab-lines">Lineas</TabsTrigger>
            <TabsTrigger value="shifts" data-testid="tab-shifts">Turnos</TabsTrigger>
            <TabsTrigger value="goals" data-testid="tab-goals">Metas</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Usuarios</TabsTrigger>
          </TabsList>

          {/* Plant Tab */}
          <TabsContent value="plant" className="mt-4">
            <PlantSettings />
          </TabsContent>

          {/* Lines Tab */}
          <TabsContent value="lines" className="mt-4">
            <LinesSettings />
          </TabsContent>

          {/* Shifts Tab */}
          <TabsContent value="shifts" className="mt-4">
            <ShiftsSettings />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="mt-4">
            <GoalsSettings />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <UsersSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PlantSettings() {
  const plant = mockPlants[0];
  const [form, setForm] = useState({
    name: plant.name,
    location: plant.location,
    timezone: plant.timezone,
    currency: plant.currency,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configuracion de planta</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="plant-name">Nombre</Label>
            <Input
              id="plant-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              data-testid="input-plant-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plant-location">Ubicacion</Label>
            <Input
              id="plant-location"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              data-testid="input-plant-location"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="plant-tz">Zona horaria</Label>
              <Input
                id="plant-tz"
                value={form.timezone}
                onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                data-testid="input-plant-timezone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plant-currency">Moneda</Label>
              <Input
                id="plant-currency"
                value={form.currency}
                onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                data-testid="input-plant-currency"
              />
            </div>
          </div>
          <Button type="button" data-testid="button-save-plant">
            <Save className="w-4 h-4 mr-1" />
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LinesSettings() {
  const lineMap = new Map(mockLines.map((l) => [l.id, l]));
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Lineas de produccion</CardTitle>
        <Button size="sm" data-testid="button-new-line">Nueva linea</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Capacidad nominal</TableHead>
              <TableHead className="text-right">Produccion ideal/dia</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLines.map((l) => (
              <TableRow key={l.id} data-testid={`row-line-${l.id}`}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell className="text-right tabular-nums">{l.nominalCapacity}</TableCell>
                <TableCell className="text-right tabular-nums">{l.idealDailyOutput}</TableCell>
                <TableCell>
                  <Badge variant={l.isActive ? "secondary" : "outline"}>
                    {l.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ShiftsSettings() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Turnos</CardTitle>
        <Button size="sm" data-testid="button-new-shift">Nuevo turno</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Hora inicio</TableHead>
              <TableHead>Hora fin</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockShifts.map((s) => (
              <TableRow key={s.id} data-testid={`row-shift-${s.id}`}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="tabular-nums">{s.startTime}</TableCell>
                <TableCell className="tabular-nums">{s.endTime}</TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "secondary" : "outline"}>
                    {s.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function GoalsSettings() {
  const lineMap = new Map(mockLines.map((l) => [l.id, l]));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metas por linea</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Linea</TableHead>
              <TableHead className="text-right">Meta produccion</TableHead>
              <TableHead className="text-right">Meta eficiencia</TableHead>
              <TableHead className="text-right">Ideal tecnico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockGoals.map((g) => (
              <TableRow key={g.id} data-testid={`row-goal-${g.id}`}>
                <TableCell className="font-medium">{lineMap.get(g.lineId)?.name || g.lineId}</TableCell>
                <TableCell className="text-right tabular-nums">{g.targetOutput}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(g.targetEfficiency)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(g.idealEfficiency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function UsersSettings() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Usuarios del sistema</CardTitle>
        <Button size="sm" data-testid="button-new-user">Nuevo usuario</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAppUsers.map((u) => (
              <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "secondary" : "outline"}>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
