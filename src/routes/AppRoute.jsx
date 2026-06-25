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
import RentalRequestsList from "@/pages/rentals/RentalRequestsList";
import RentalRequestDetail from "@/pages/rentals/RentalRequestDetail";

import ReportsDashboard from "@/pages/admin/reports/reportsDashboard";
import LoyaltyDashboard from "@/pages/admin/loyalty/LoyaltyDashboard";

import InvoicesPage from "@/pages/admin/invoices/InvoicesPage";

//import { ROUTE_PERMISSIONS } from "@/lib/route-permissions";
import { PERMISSIONS_GROUPS } from "@/lib/routePermissions";

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

        {/* ============================
            RUTAS ADMIN 
        ============================ */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.DASHBOARD}>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/billboard"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.BILLBOARD}>
              <AdminLayout>
                <Billboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catalogo"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.MAESTROS}>
              <AdminLayout>
                <CatalogsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sucursales"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.CINEMAS}>
              <AdminLayout>
                <CinemasPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/personal"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.PERSONAL}>
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
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.INVENTORY}>
              <AdminLayout>
                <ProductsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/finanzas"
          element={
            <ProtectedRoute
              anyOf={PERMISSIONS_GROUPS.FINANCES}
            >
              <AdminLayout>
                <FinancesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.REPORTS}>
              <AdminLayout>
                <ReportsDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/loyalty"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.LOYALTY}>
              <AdminLayout>
                <LoyaltyDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/invoices"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.INVOICES}>
              <AdminLayout>
                <InvoicesPage />
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
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.RENTALS}>
              <AdminLayout>
                <RentalRequestsList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rentals/:id"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.RENTALS}>
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
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.DASHBOARD_CASHIER}>
              <AdminLayout>
                <DashboardCashier />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticketOffice/sell"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.SELL_TICKETS}>
              <AdminLayout>
                <SellTickets />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticketOffice/candy"
          element={
            <ProtectedRoute anyOf={PERMISSIONS_GROUPS.CONFECTIONERY}>
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
