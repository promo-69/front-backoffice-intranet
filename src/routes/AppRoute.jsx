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
import PrivateRoute from "./PrivateRoute";
import GlobalLoader from "../components/ui/GlobalLoader";
import { useLoading } from "../context/LoadingContext";

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

        {/* Rutas ADMIN basadas en permisos */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute permission="dashboard">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/exhibition"
          element={
            <PrivateRoute permission="exhibition">
              <AdminLayout>
                <Exhibition />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/catalogo"
          element={
            <PrivateRoute permission="catalog">
              <AdminLayout>
                <CatalogsPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/sucursales"
          element={
            <PrivateRoute permission="cinemas">
              <AdminLayout>
                <CinemasPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/personal"
          element={
            <PrivateRoute permission="personal">
              <AdminLayout>
                <Personal />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/transacciones"
          element={
            <PrivateRoute permission="transactions">
              <AdminLayout>
                <div className="p-4">Próximamente: Transacciones</div>
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/inventario"
          element={
            <PrivateRoute permission="inventory">
              <AdminLayout>
                <ProductsPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <PrivateRoute permission="reports">
              <AdminLayout>
                <div className="p-4">Próximamente: Reportes</div>
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Rutas de Cajero */}
        <Route
          path="/ticketOffice/dashboard"
          element={
            <PrivateRoute permission="dashboard_cashier">
              <AdminLayout>
                <DashboardCashier />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticketOffice/sell"
          element={
            <PrivateRoute permission="sell_tickets">
              <AdminLayout>
                <SellTickets />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticketOffice/candy"
          element={
            <PrivateRoute permission="candy_bar">
              <AdminLayout>
                <CandyBar />
              </AdminLayout>
            </PrivateRoute>
          }
        />
      </Routes>

      {loading && <GlobalLoader />}
    </BrowserRouter>
  );
}

export default AppRoute;
