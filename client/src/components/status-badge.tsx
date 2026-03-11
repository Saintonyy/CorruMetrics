import { Badge } from "@/components/ui/badge";
import type { EfficiencyStatus } from "@shared/schema";

const statusConfig: Record<EfficiencyStatus, { label: string; className: string }> = {
  optimo: { label: "Optimo", className: "bg-status-optimo status-optimo border-transparent" },
  estable: { label: "Estable", className: "bg-status-estable status-estable border-transparent" },
  riesgo: { label: "Riesgo", className: "bg-status-riesgo status-riesgo border-transparent" },
  critico: { label: "Critico", className: "bg-status-critico status-critico border-transparent" },
};

export function StatusBadge({ status }: { status: EfficiencyStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={`font-semibold text-xs ${config.className}`}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
