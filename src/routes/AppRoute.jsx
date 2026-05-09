import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login";
import Dashboard from "../pages/admin/dashboard";
import DashboardCashier from "../pages/ticketOffice/dashboardCashier";
import Exhibition from "@/pages/admin/exhibition/exhibition2";
import SellTickets from "../pages/ticketOffice/sellTickets";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import CashierLayout from "../layouts/CashierLayout";
import Users from "../pages/admin/users/users";
import CinemasPage from "../pages/admin/cinemas/cinemas";

function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas de Autenticación */}
        <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        {/* Rutas Administrativas (Temporalmente Públicas) */}
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/exhibition" element={<AdminLayout><Exhibition /></AdminLayout>} />
        
        {/* Ruta para la gestión de sucursales */}
        <Route path="/admin/sucursales" element={<AdminLayout><CinemasPage /></AdminLayout>} />
        
        <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
        
        {/* Módulos en desarrollo */}
        <Route path="/admin/transacciones" element={<AdminLayout><div className="p-4">Próximamente: Transacciones</div></AdminLayout>} />
        <Route path="/admin/inventario" element={<AdminLayout><div className="p-4">Próximamente: Inventario</div></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><div className="p-4">Próximamente: Reportes</div></AdminLayout>} />

        {/* Rutas de Taquilla / Cajero (Temporalmente Públicas) */}
        <Route
          path="/ticketOffice/dashboard"
          element={
            <CashierLayout>
              <DashboardCashier />
            </CashierLayout>
          }
        />

        <Route
          path="/ticketOffice/sell"
          element={
            <CashierLayout>
              <SellTickets />
            </CashierLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoute;