import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/login";
import Dashboard from "../pages/admin/dashboard";
import DashboardCashier from "../pages/ticketOffice/dashboardCashier";
import Exhibition from "@/pages/admin/exhibition/exhibition2";
import SellTickets from "../pages/ticketOffice/sellTickets";
import CandyBar from "../pages/ticketOffice/candyBar";

import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

import Personal from "../pages/admin/personal/personalPage";
import CinemasPage from "../pages/admin/cinemas/cinemas";
import CatalogsPage from "../pages/admin/catalogs/catalogs";
import ProductsPage from "../pages/admin/inventory/products";

import ProtectedRoute from "./ProtectedRoute";
import GlobalLoader from "../components/ui/GlobalLoader";
import { useLoading } from "../context/LoadingContext";

import CreateRolePage from "@/pages/admin/personal/createRolePage";
import NoAccess from "@/pages/noAccess";

function AppRoute() {
  const { loading } = useLoading();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
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

        <Route path="/no-access" element={<NoAccess />} />

        {/* ============================
            RUTAS ADMIN (roles altos)
        ============================ */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN",
                "GENERAL_MANAGER",
                "CINEMA_MANAGER",
                "USHER",
              ]}
            >
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/exhibition"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN",
                "GENERAL_MANAGER",
                "CINEMA_MANAGER",
              ]}
            >
              <AdminLayout>
                <Exhibition />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catalogo"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "GENERAL_MANAGER"]}>
              <AdminLayout>
                <CatalogsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sucursales"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN",
                "GENERAL_MANAGER",
                "CINEMA_MANAGER",
              ]}
            >
              <AdminLayout>
                <CinemasPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/personal"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "GENERAL_MANAGER"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Personal />} />
          <Route path="create-role" element={<CreateRolePage />} />
        </Route>

        <Route
          path="/admin/inventario"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "GENERAL_MANAGER"]}>
              <AdminLayout>
                <ProductsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "GENERAL_MANAGER"]}>
              <AdminLayout>
                <div className="p-4">Próximamente: Reportes</div>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================
            RUTAS CAJERO
        ============================ */}
        <Route
          path="/ticketOffice/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CASHIER"]}>
              <AdminLayout>
                <DashboardCashier />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticketOffice/sell"
          element={
            <ProtectedRoute allowedRoles={["CASHIER"]}>
              <AdminLayout>
                <SellTickets />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticketOffice/candy"
          element={
            <ProtectedRoute allowedRoles={["CASHIER"]}>
              <AdminLayout>
                <CandyBar />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {loading && <GlobalLoader />}
    </BrowserRouter>
  );
}

export default AppRoute;
