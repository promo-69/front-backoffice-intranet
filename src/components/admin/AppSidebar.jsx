import {
  LayoutDashboard,
  Film,
  MapPin,
  Users,
  UserRound,
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
import { PERMISSIONS_GROUPS } from "@/lib/routePermissions";

const navItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    requiredPermissions: PERMISSIONS_GROUPS.DASHBOARD,
  },
  {
    id: "cinemas",
    title: "Sucursales",
    url: "/admin/sucursales",
    icon: MapPin,
    requiredPermissions: PERMISSIONS_GROUPS.CINEMAS,
  },
  {
    id: "personal",
    title: "Personal",
    url: "/admin/personal",
    icon: Users,
    requiredPermissions: PERMISSIONS_GROUPS.PERSONAL,
  },
  {
    id: "customers",
    title: "Clientes",
    url: "/admin/customers",
    icon: UserRound,
    requiredPermissions: PERMISSIONS_GROUPS.CUSTOMERS,
  },
  {
    id: "billboard",
    title: "Cartelera",
    url: "/admin/billboard",
    icon: Film,
    requiredPermissions: PERMISSIONS_GROUPS.BILLBOARD,
  },
  {
    id: "inventory",
    title: "Inventario",
    url: "/admin/inventario",
    icon: Package,
    requiredPermissions: PERMISSIONS_GROUPS.INVENTORY,
  },
  {
    id: "catalog",
    title: "Maestros",
    url: "/admin/catalogo",
    icon: BookOpen,
    requiredPermissions: PERMISSIONS_GROUPS.MAESTROS,
  },
  {
    id: "loyalty",
    title: "Fidelización",
    url: "/admin/loyalty",
    icon: Sparkles,
    requiredPermissions: PERMISSIONS_GROUPS.LOYALTY,
  },
  {
    id: "rentals",
    title: "Alquiler de Salas",
    url: "/admin/rentals",
    icon: Calendar,
    requiredPermissions: PERMISSIONS_GROUPS.RENTALS,
  },
  {
    id: "reports",
    title: "Reportes",
    url: "/admin/reports",
    icon: BarChart3,
    requiredPermissions: PERMISSIONS_GROUPS.REPORTS,
  },
  {
    id: "invoices",
    title: "Facturas",
    url: "/admin/invoices",
    icon: Receipt,
    requiredPermissions: PERMISSIONS_GROUPS.INVOICES,
  },
  {
    id: "finances",
    title: "Finanzas",
    url: "/admin/finanzas",
    icon: Landmark,
    requiredPermissions: PERMISSIONS_GROUPS.FINANCES,
  },

  // Cajero
  {
    id: "sell_tickets",
    title: "Venta de Boletos",
    url: "/ticketOffice/sell",
    icon: TicketIcon,
    requiredPermissions: PERMISSIONS_GROUPS.SELL_TICKETS,
  },
  {
    id: "candy_bar",
    title: "Caramelería",
    url: "/ticketOffice/candy",
    icon: ShoppingBag,
    requiredPermissions: PERMISSIONS_GROUPS.CONFECTIONERY,
  },
];

export function AppSidebar({ className, ...props }) {
  const { canAny } = usePermission();
  const { logout } = useAuth();

  const visibleMenu = navItems.filter((item) => {
    if (!item.requiredPermissions || item.requiredPermissions.length === 0)
      return true;

    return canAny(item.requiredPermissions);
  });

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
