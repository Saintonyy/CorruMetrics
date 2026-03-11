import { useState, useMemo } from "react";
import { TopHeader } from "@/components/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search } from "lucide-react";
import { mockEmployees, mockLines, mockShifts } from "@/lib/mock-data";
import { EMPLOYEE_ROLES } from "@shared/schema";

const ROLE_LABELS: Record<string, string> = {
  operador: "Operador",
  supervisor: "Supervisor",
  gerente: "Gerente",
  director: "Director",
  admin: "Admin",
};

export default function EmployeesPage() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [lineFilter, setLineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeLines = mockLines.filter((l) => l.isActive);
  const lineMap = new Map(mockLines.map((l) => [l.id, l]));
  const shiftMap = new Map(mockShifts.map((s) => [s.id, s]));

  const filtered = useMemo(() => {
    let emps = [...mockEmployees];
    if (roleFilter !== "all") emps = emps.filter((e) => e.role === roleFilter);
    if (lineFilter !== "all") emps = emps.filter((e) => e.lineId === lineFilter);
    if (statusFilter !== "all") {
      const active = statusFilter === "active";
      emps = emps.filter((e) => e.isActive === active);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      emps = emps.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    return emps.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [roleFilter, lineFilter, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <TopHeader title="Personal" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nombre o email..."
                className="pl-8 w-[220px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-employees"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-role-filter">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {EMPLOYEE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={lineFilter} onValueChange={setLineFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-emp-line-filter">
                <SelectValue placeholder="Linea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {activeLines.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]" data-testid="select-status-filter">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-employee">
                <Plus className="w-4 h-4 mr-1" />
                Nuevo empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo empleado</DialogTitle>
              </DialogHeader>
              <EmployeeForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Linea</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((emp) => (
                    <TableRow key={emp.id} data-testid={`row-employee-${emp.id}`}>
                      <TableCell className="font-medium">{emp.fullName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{emp.email}</TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">{ROLE_LABELS[emp.role] || emp.role}</span>
                      </TableCell>
                      <TableCell>{emp.lineId ? lineMap.get(emp.lineId)?.name : "—"}</TableCell>
                      <TableCell>{emp.shiftId ? shiftMap.get(emp.shiftId)?.name : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={emp.isActive ? "secondary" : "outline"}>
                          {emp.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
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

function EmployeeForm({ onClose }: { onClose: () => void }) {
  const activeLines = mockLines.filter((l) => l.isActive);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    lineId: "",
    shiftId: "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST to /api/employees
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emp-name">Nombre completo</Label>
        <Input
          id="emp-name"
          placeholder="Juan Perez"
          value={form.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          required
          data-testid="input-emp-name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emp-email">Email</Label>
        <Input
          id="emp-email"
          type="email"
          placeholder="juan@corrumetrics.mx"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          data-testid="input-emp-email"
        />
      </div>

      <div className="space-y-2">
        <Label>Rol</Label>
        <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
          <SelectTrigger data-testid="form-emp-role">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYEE_ROLES.map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Linea</Label>
          <Select value={form.lineId} onValueChange={(v) => handleChange("lineId", v)}>
            <SelectTrigger data-testid="form-emp-line">
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
            <SelectTrigger data-testid="form-emp-shift">
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

      <div className="flex gap-2 pt-2">
        <Button type="submit" data-testid="button-save-employee">Guardar</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}
