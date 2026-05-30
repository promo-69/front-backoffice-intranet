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

import { ROUTE_PERMISSIONS } from "@/lib/route-permissions";

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
            RUTAS ADMIN (PERMISOS REALES)
        ============================ */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.DASHBOARD_ADMIN}>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/exhibition"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.EXHIBITION_READ}>
              <AdminLayout>
                <Exhibition />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catalogo"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.CATALOG_READ}>
              <AdminLayout>
                <CatalogsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sucursales"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.CINEMAS_READ}>
              <AdminLayout>
                <CinemasPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/personal"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.PERSONAL_READ}>
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
            <ProtectedRoute permission={ROUTE_PERMISSIONS.INVENTORY_READ}>
              <AdminLayout>
                <ProductsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.REPORTS_READ}>
              <AdminLayout>
                <div className="p-4">Próximamente: Reportes</div>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================
            RUTAS CAJERO (PERMISOS REALES)
        ============================ */}

        <Route
          path="/ticketOffice/dashboard"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.CASHIER_DASHBOARD}>
              <AdminLayout>
                <DashboardCashier />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticketOffice/sell"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.SELL_TICKETS}>
              <AdminLayout>
                <SellTickets />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticketOffice/candy"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.CANDY_BAR}>
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
