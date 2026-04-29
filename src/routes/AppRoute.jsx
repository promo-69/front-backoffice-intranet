import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login";
import Dashboard from "../pages/admin/dashboard";
import DashboardCashier from "../pages/ticketOffice/dashboardCashier";
import Exhibition from "@/pages/admin/exhibition/exhibition";
import SellTickets from "../pages/ticketOffice/sellTickets";
import PrivateRoute from "./PrivateRoute";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import CashierLayout from "../layouts/CashierLayout";
import Users from "../pages/admin/users/users";
import CinemasPage from "../pages/admin/cinemas/cinemas";

function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        {/* Rutas Admin */}
        <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminLayout><Dashboard /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/exhibition" element={<PrivateRoute role="admin"><AdminLayout><Exhibition /></AdminLayout></PrivateRoute>} />
        
        {/* Aquí es donde usas CinemasPage para la ruta de sucursales */}
        <Route path="/admin/sucursales" element={<PrivateRoute role="admin"><AdminLayout><CinemasPage /></AdminLayout></PrivateRoute>} />
        
        <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminLayout><Users /></AdminLayout></PrivateRoute>} />
        
        {/* Rutas en desarrollo (Admin) */}
        <Route path="/admin/transacciones" element={<PrivateRoute role="admin"><AdminLayout><div className="p-4">Próximamente: Transacciones</div></AdminLayout></PrivateRoute>} />
        <Route path="/admin/inventario" element={<PrivateRoute role="admin"><AdminLayout><div className="p-4">Próximamente: Inventario</div></AdminLayout></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute role="admin"><AdminLayout><div className="p-4">Próximamente: Reportes</div></AdminLayout></PrivateRoute>} />

        {/* Rutas Cajero - CORREGIDAS (Eliminé la duplicada) */}
        <Route
          path="/ticketOffice/dashboard"
          element={
            <PrivateRoute role="cashier">
              <CashierLayout>
                <DashboardCashier />
              </CashierLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticketOffice/sell"
          element={
            <PrivateRoute role="cashier">
              <CashierLayout>
                <SellTickets />
              </CashierLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoute;
