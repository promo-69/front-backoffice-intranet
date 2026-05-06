import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login";
import Dashboard from "../pages/admin/dashboard";
import DashboardCashier from "../pages/ticketOffice/dashboardCashier";
import Exhibition from "@/pages/admin/exhibition/exhibition";
import SellTickets from "../pages/ticketOffice/sellTickets";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import CashierLayout from "../layouts/CashierLayout";
import Users from "../pages/admin/users/users";
import CinemasPage from "../pages/admin/cinemas/cinemas";
import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "../context/AuthContext";

function AppRoute() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas de Autenticación */}
          <Route
            path="/"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />

          {/* Rutas Administrativas Protegidas */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin">
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/exhibition"
            element={
              <PrivateRoute role="admin">
                <AdminLayout>
                  <Exhibition />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          {/* Ruta para la gestión de sucursales */}
          <Route
            path="/admin/sucursales"
            element={
              <PrivateRoute role="admin">
                <AdminLayout>
                  <CinemasPage />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateRoute role="admin">
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          {/* Módulos en desarrollo */}
          <Route
            path="/admin/transacciones"
            element={
              <PrivateRoute role="admin">
                <AdminLayout>
                  <div className="p-4">Próximamente: Transacciones</div>
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/inventario"
            element={
              <PrivateRoute role="admin">
                <AdminLayout>
                  <div className="p-4">Próximamente: Inventario</div>
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute role="admin">
                <AdminLayout>
                  <div className="p-4">Próximamente: Reportes</div>
                </AdminLayout>
              </PrivateRoute>
            }
          />

          {/* Rutas de Taquilla / Cajero Protegidas */}
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
    </AuthProvider>
  );
}

export default AppRoute;