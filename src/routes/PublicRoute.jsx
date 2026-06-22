import { Navigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";
import { ROUTE_PERMISSIONS } from "@/lib/route-permissions";

export default function PublicRoute({ children }) {
  const { role, permissions } = usePermission();

  if (role) {
    // Intentar derivar landing según permisos reales
    const perms = new Set((permissions || []).map((p) => (p || "").toString().trim().toUpperCase()));

    const getLanding = () => {
      if (role === "SUPER_ADMIN") return "/admin/dashboard";
      if (perms.has(ROUTE_PERMISSIONS.DASHBOARD_ADMIN)) return "/admin/dashboard";
      if (perms.has(ROUTE_PERMISSIONS.EXHIBITION_READ)) return "/admin/billboard";
      if (perms.has(ROUTE_PERMISSIONS.CATALOG_READ)) return "/admin/catalogo";
      if (perms.has(ROUTE_PERMISSIONS.CINEMAS_READ)) return "/admin/sucursales";
      if (perms.has(ROUTE_PERMISSIONS.PERSONAL_READ)) return "/admin/personal";
      if (perms.has(ROUTE_PERMISSIONS.INVENTORY_READ)) return "/admin/inventario";
      if (
        perms.has(ROUTE_PERMISSIONS.CASHIER_DASHBOARD) ||
        perms.has(ROUTE_PERMISSIONS.SELL_TICKETS) ||
        role === "CASHIER"
      ) return "/ticketOffice/dashboard";
      if (
        perms.has(ROUTE_PERMISSIONS.FINANCES_READ) ||
        perms.has(ROUTE_PERMISSIONS.CURRENCIES_PAGE) ||
        perms.has(ROUTE_PERMISSIONS.RATES_PAGE) ||
        perms.has(ROUTE_PERMISSIONS.BANK_ACCOUNTS_PAGE)
      ) return "/admin/finanzas";
      if (perms.has(ROUTE_PERMISSIONS.REPORTS_READ)) return "/admin/reports";
      return null;
    };

    const landing = getLanding();
    if (landing) return <Navigate to={landing} replace />;

    // Si no sabemos dónde enviarlo, caer a /no-access
    return <Navigate to="/no-access" replace />;
  }

  return children;
}
