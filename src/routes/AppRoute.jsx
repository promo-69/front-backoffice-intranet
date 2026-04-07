import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login";
import Dashboard from "../pages/admin/dashboard";
//import TicketDashboard from "../pages/ticketOffice/Dashboard";
//import PrivateRoute from "./PrivateRoute";
//import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública con layout */}
        <Route
          path="/"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        {/* Rutas privadas */}
        
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoute;
