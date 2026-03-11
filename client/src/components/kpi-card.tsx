import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon?: LucideIcon;
}

export function KpiCard({ label, value, subtitle, trend, icon: Icon }: KpiCardProps) {
  const trendColor =
    trend === undefined || trend === 0
      ? "text-muted-foreground"
      : trend > 0
      ? "status-optimo"
      : "status-critico";

  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
      ? TrendingUp
      : TrendingDown;

  return (
    <Card data-testid={`kpi-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {label}
            </span>
            <span className="text-2xl font-bold tabular-nums leading-none">
              {value}
            </span>
            {subtitle && (
              <span className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {Icon && (
              <div className="p-2 rounded-md bg-muted">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            {trend !== undefined && (
              <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                <span className="tabular-nums">
                  {trend > 0 ? "+" : ""}
                  {trend.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
