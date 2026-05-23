import { LayoutDashboard, Film, MapPin, Users, Receipt, Package, BarChart3, LogOut, TicketIcon, BookOpen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import LogoCineflix from "@/assets/images/logotype/logoCiineflix1.png"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/permissions";

// Cada item tiene un "id" que coincide con los permisos
const navItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },

    {
    id: "cinemas",
    title: "Sucursales",
    url: "/admin/sucursales",
    icon: MapPin,
  },

  { id: "personal",
    title: "Personal",
    url: "/admin/personal",
    icon: Users 
  },

  {
    id: "exhibition",
    title: "Cartelera",
    url: "/admin/exhibition",
    icon: Film,
  },
  
  {
    id: "inventory",
    title: "Inventario",
    url: "/admin/inventario",
    icon: Package,
  },

  {
    id: "catalog",
    title: "Maestros",
    tooltip: "Catalogos o clasificacion Base del software",
    url: "/admin/catalogo",
    icon: BookOpen,
  },

  {
    id: "reports",
    title: "Reportes",
    url: "/admin/reports",
    icon: BarChart3
  },
  {
    id: "dashboard_cashier",
    title: "Dashboard Cajero",
    url: "/ticketOffice/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "sell_tickets",
    title: "Venta de Boletos",
    url: "/ticketOffice/sell",
    icon: TicketIcon,
  },
];

export function AppSidebar({ className, ...props }) {
  const { user } = useAuth();

  // Si no hay usuario, no mostramos nada
  if (!user) return null;

  // Permisos del rol actual
  const allowed = PERMISSIONS[user.roleCode] || [];

  // Filtrar menú según permisos
  const visibleMenu = navItems.filter((item) => allowed.includes(item.id));

  return (
    <Sidebar
      {...props}
      className={cn(
        "bg-[#231640] text-white !border-r-0 !border-none",
        className,
      )}
    >
      <SidebarHeader className="px-6 pt-6 pb-2">
        <div className="w-full flex justify-center mb-4">
          <img
            src={LogoCineflix}
            alt="Cineflix Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
        <p className="text-[10px] font-montserrat text-gray-400 uppercase tracking-widest mt-1">
          Intranet Administrativa
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 px-6 mb-2 font-bold">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenu.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.tooltip || item.title}
                    className="hover:bg-white/10 hover:text-white py-6 px-6 group transition-colors"
                  >
                    <Link to={item.url}>
                      <item.icon className="group-hover:text-brand-gold transition-colors" />
                      <span className="font-montserrat font-medium">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-red-500/10 hover:text-red-400 py-6 px-6"
            >
              <a href="/login">
                <LogOut />
                <span className="font-bold">Cerrar sesión</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}