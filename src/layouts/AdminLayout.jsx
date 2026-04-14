import { useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";

export default function AdminLayout({ children }) {
  const location = useLocation();

  // Mapeo de rutas a títulos
  const getPageTitle = (pathname) => {
    const titles = {
      "/admin/users": "Usuarios",
      "/admin/cartelera": "Gestión de Peliculas/Funciones",
      "/admin/sucursales": "Sucursales",
      "/admin/transacciones": "Transacciones",
      "/admin/inventario": "Inventario",
      "/admin/reports": "Reportes",
      "/": "Dashboard",
    };

    return titles[pathname] || "Dashboard";
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title={currentTitle} />
        {/* Contenido dinámico */}
        <main className="flex-1 p-6 bg-[#CAC6DA]">{children}</main>
      </div>
    </div>
  );
}
