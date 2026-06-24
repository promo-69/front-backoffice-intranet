import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/login";
import Dashboard from "../pages/admin/dashboard";
import DashboardCashier from "../pages/ticketOffice/dashboardCashier";
import Billboard from "../pages/admin/billboard/billboard";
//import Exhibition from "@/pages/admin/exhibition/bilboardPage";
import SellTickets from "../pages/ticketOffice/sellTickets";
import CandyBar from "../pages/ticketOffice/candyBar";

import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

import Personal from "../pages/admin/personal/personalPage";
import CinemasPage from "../pages/admin/cinemas/cinemas";
import CatalogsPage from "../pages/admin/catalogs/catalogs";
import ProductsPage from "../pages/admin/inventory/products";
import FinancesPage from "../pages/admin/finances/finances";

import ProtectedRoute from "./ProtectedRoute";
import GlobalLoader from "../components/ui/GlobalLoader";
import { useLoading } from "../context/LoadingContext";

import CreateRolePage from "@/pages/admin/personal/createRolePage";
import EditRolePage from "@/pages/admin/personal/editRolePage";
import NoAccess from "@/pages/noAccess";
import RentalRequestsList from "@/pages/rentals/RentalRequestsList";
import RentalRequestDetail from "@/pages/rentals/RentalRequestDetail";

import ReportsDashboard from "@/pages/admin/reports/reportsDashboard";

import { ROUTE_PERMISSIONS } from "@/lib/route-permissions";

import PublicRoute from "./PublicRoute";

function AppRoute() {
  const { loading } = useLoading();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </PublicRoute>
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
          path="/admin/billboard"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.EXHIBITION_READ}>
              <AdminLayout>
                <Billboard />
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
          <Route path="edit-role" element={<EditRolePage />} />
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
          path="/admin/finanzas"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.FINANCES_READ}>
              <AdminLayout>
                <FinancesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.REPORTS_READ}>
              <AdminLayout>
                <ReportsDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================
            RUTAS ALQUILER DE SALAS
        ============================ */}

        <Route
          path="/admin/rentals"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.RENTALS_READ}>
              <AdminLayout>
                <RentalRequestsList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rentals/:id"
          element={
            <ProtectedRoute permission={ROUTE_PERMISSIONS.RENTALS_READ}>
              <AdminLayout>
                <RentalRequestDetail />
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

        {/* ============================
            CATCH-ALL (RUTA NO ENCONTRADA)
        ============================ */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {loading && <GlobalLoader />}
    </BrowserRouter>
  );
}

export default AppRoute;
