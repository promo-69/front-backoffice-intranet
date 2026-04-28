import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login";
import Dashboard from "../pages/admin/dashboard";
import DashboardCashier from "../pages/ticketOffice/dashboardCashier";
import Exhibition from "@/pages/admin/exhibition/exhibition";
//import Sucursales from "@/pages/admin/sucursales";
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
        {/* Ruta pública con layout */}
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

        <Route
          path="/admin/transacciones"
          element={
            <PrivateRoute role="admin">
              <AdminLayout></AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/inventario"
          element={
            <PrivateRoute role="admin">
              <AdminLayout></AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <PrivateRoute role="admin">
              <AdminLayout></AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Rutas privadas cajero */}
        <Route
          path="/ticketOffice/dashboard"
          element={
            <PrivateRoute role="cashier">
              <DashboardCashier />
            </PrivateRoute>
          }
        />

        <Route
          path="/ticketOffice/dashboard"
          element={
            <PrivateRoute role="cashier">
              <CashierLayout />
            </PrivateRoute>
          }
        />

        <Route
          path="/ticketOffice/sell"
          element={
            <PrivateRoute role="cashier">
              <SellTickets />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoute;
