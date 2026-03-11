import { SidebarTrigger } from "@/components/ui/sidebar";
import { mockPlants } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Factory } from "lucide-react";

export function TopHeader({ title }: { title: string }) {
  const plant = mockPlants[0];

  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3 bg-background sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <h1 className="text-lg font-semibold tracking-tight" data-testid="text-page-title">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1.5">
          <Factory className="w-3 h-3" />
          {plant.name}
        </Badge>
      </div>
    </header>
  );
}
