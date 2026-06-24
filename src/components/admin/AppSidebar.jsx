import {
  LayoutDashboard,
  Film,
  MapPin,
  Users,
  Package,
  BarChart3,
  LogOut,
  TicketIcon,
  ShoppingBag,
  BookOpen,
  Calendar,
  Landmark,
  Sparkles,
  Receipt,
} from "lucide-react";

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
} from "@/components/ui/sidebar";

import LogoCineflix from "@/assets/images/logotype/logoCiineflix1.png";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    permission: "CRUD:READ:PAYMENTS_MODULE",
  },
  {
    id: "cinemas",
    title: "Sucursales",
    url: "/admin/sucursales",
    icon: MapPin,
    permission: "CRUD:READ:CINEMAS",
  },
  {
    id: "personal",
    title: "Personal",
    url: "/admin/personal",
    icon: Users,
    permission: "CRUD:READ:EMPLOYEES",
  },
  {
    id: "billboard",
    title: "Cartelera",
    url: "/admin/billboard",
    icon: Film,
    permission: "CRUD:READ:ROOM-EVENTS",
  },
  {
    id: "inventory",
    title: "Inventario",
    url: "/admin/inventario",
    icon: Package,
    permission: "CRUD:READ:PRODUCTS",
  },
  {
    id: "catalog",
    title: "Maestros",
    url: "/admin/catalogo",
    icon: BookOpen,
    permission: "CRUD:READ:CATALOGS",
  },
  {
    id: "loyalty",
    title: "Fidelización",
    url: "/admin/loyalty",
    icon: Sparkles,
    permission: "CRUD:READ:CATALOGS",
  },
  {
    id: "rentals",
    title: "Alquiler de Salas",
    url: "/admin/rentals",
    icon: Calendar,
    permission: "CRUD:READ:RENTALS",
  },
  {
    id: "reports",
    title: "Reportes",
    url: "/admin/reports",
    icon: BarChart3,
    permission: "CRUD:READ:REPORTS",
  },
  {
    id: "invoices",
    title: "Facturas",
    url: "/admin/invoices",
    icon: Receipt,
    permission: "CRUD:READ:INVOICES",
  },
  {
    id: "finances",
    title: "Finanzas",
    url: "/admin/finanzas",
    icon: Landmark,
    permission: "CRUD:READ:CURRENCIES",
  },

  // Cajero
  {
    id: "dashboard_cashier",
    title: "Dashboard Cajero",
    url: "/ticketOffice/dashboard",
    icon: LayoutDashboard,
    permission: "CRUD:READ:PRODUCTS",
  },
  {
    id: "sell_tickets",
    title: "Venta de Boletos",
    url: "/ticketOffice/sell",
    icon: TicketIcon,
    permission: "CRUD:READ:CINEMAS-ROOM-EVENTS",
  },
  {
    id: "candy_bar",
    title: "Caramelería",
    url: "/ticketOffice/candy",
    icon: ShoppingBag,
    permission: "CRUD:READ:COMBOS",
  },
];

export function AppSidebar({ className, ...props }) {
  const { can } = usePermission();
  const { logout } = useAuth();

  // Filtrar por permisos reales
  const visibleMenu = navItems.filter((item) => can(item.permission));

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
              className="hover:bg-red-500/10 hover:text-red-400 py-6 px-6 cursor-pointer"
            >
              <button onClick={logout}>
                <LogOut />
                <span className="font-bold">Cerrar sesión</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
