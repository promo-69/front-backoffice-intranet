import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login";
//import AdminDashboard from "../pages/admin/Dashboard";
//import TicketDashboard from "../pages/ticketOffice/Dashboard";
//import PrivateRoute from "./PrivateRoute";
import AuthLayout from "../layouts/AuthLayout";

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

        {/* Rutas privada */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoute;
