import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext";


export function Navbar({ sectionTitle }) {

  const { user, logout } = useAuth();
  const { open } = useSidebar();

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const email = user?.email || "";
  const role = user?.role || "";

  const formatRole = (role) =>
    role
      ?.toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-6 fixed top-0 left-0 right-0 z-10 transition-all duration-300">
      <div
        className="flex items-center gap-2 w-full transition-all duration-300"
        style={{
          marginLeft: open ? "215px" : "0px",
        }}
      >
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex-1 flex justify-between items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/admin/dashboard"
                  className="text-xs uppercase font-bold text-gray-400"
                >
                  Intranet
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs uppercase font-bold text-brand-primary">
                  {sectionTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Lado Derecho: Acciones y Perfil */}
          <div className="ml-auto flex items-center gap-2">
            <Separator orientation="vertical" className="mx-2 h-8" />

            {/* Perfil de Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 pl-2 hover:bg-surface-hover"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-bold leading-none text-brand-primary uppercase">
                      {fullName || email}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatRole(role)}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white border-2 border-brand-gold/20 shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuSeparator />
                <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                <DropdownMenuItem>Ajustes de Seguridad</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-status-error font-bold"
                  onClick={logout}
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}