import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Factory,
  Clock,
  Users,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Produccion", url: "/app/production", icon: Factory },
  { title: "Paros", url: "/app/downtime", icon: Clock },
  { title: "Personal", url: "/app/employees", icon: Users },
  { title: "Reportes", url: "/app/reports", icon: FileBarChart },
  { title: "Configuracion", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 pb-2">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <svg
            viewBox="0 0 32 32"
            className="w-8 h-8"
            fill="none"
            aria-label="CorruMetrics logo"
          >
            <rect x="2" y="2" width="28" height="28" rx="4" stroke="hsl(184 80% 22%)" strokeWidth="2.5" />
            <path d="M8 22 L12 12 L16 18 L20 8 L24 16" stroke="hsl(184 80% 22%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="1.5" fill="hsl(184 80% 22%)" />
            <circle cx="20" cy="8" r="1.5" fill="hsl(184 80% 22%)" />
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight" data-testid="text-logo">
              CorruMetrics
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Inteligencia operativa
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  location === item.url ||
                  (item.url !== "/app/dashboard" &&
                    location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent font-medium" : ""}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate" data-testid="text-user-name">
                {user.fullName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate capitalize">
                {user.role}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
