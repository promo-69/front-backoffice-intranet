import { LayoutDashboard, Film, MapPin, Users, Receipt, Package, BarChart3, LogOut } from "lucide-react"
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
import LogoCineflix from "@/assets/images/logotype/logoCiineflix.png"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Cartelera", url: "/admin/cartelera", icon: Film },
  { title: "Sucursales", url: "/admin/sucursales", icon: MapPin },
  { title: "Usuarios", url: "/admin/users", icon: Users },
  { title: "Transacciones", url: "/admin/transacciones", icon: Receipt },
  { title: "Inventario", url: "/admin/inventario", icon: Package },
  { title: "Reportes", url: "/admin/reports", icon: BarChart3 },
]

export function AppSidebar({className, ...props }) {
  return (
    <Sidebar
      {...props}
      className={cn("bg-[#231640] text-white border-r-0", className)}
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
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