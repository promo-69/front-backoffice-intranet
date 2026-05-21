import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { Navbar } from "@/components/admin/Header";
import { useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminLayoutContent location={location}>
          {children}
        </AdminLayoutContent>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AdminLayoutContent({ location, children }) {
  const { open } = useSidebar();

  const getPageTitle = (pathname) => {
    const titles = {
      "/admin/dashboard": "Dashboard",
      "/admin/exhibition": "Gestión de Cartelera",
      "/admin/sucursales": "Gestión de Sucursales y Salas",
      "/admin/users": "Gestión de Usuarios",
      "/admin/transacciones": "Registro de Transacciones",
      "/admin/inventario": "Control de Inventario",
      "/admin/reports": "Reportes",
      "/admin/catalogo": "Gestión de Maestros",
    };
    return titles[pathname] || "Dashboard";
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <>
      <AppSidebar className="z-20" />

      <SidebarInset className="bg-surface-main flex flex-col min-h-screen w-full overflow-y-auto transition-all duration-300">
        <Navbar sectionTitle={currentTitle} />

        <main
          className="flex-1 w-full transition-all duration-300"
          style={{
            paddingLeft: open ? "200px" : "80px",
            paddingTop: "45px",
          }}
        >
          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
            <header className="mb-8">
              <h1 className="text-h1-display text-brand-primary font-bebas tracking-wide uppercase">
                {currentTitle}
              </h1>
            </header>

            <section >
              {children}
            </section>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}