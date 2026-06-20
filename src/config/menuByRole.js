export const menuByRole = {
  SUPER_ADMIN: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Usuarios", path: "/admin/users" },
    { label: "Empleados", path: "/admin/employees" },
    { label: "Roles", path: "/admin/roles" },
    { label: "Permisos", path: "/admin/permissions" },
    { label: "Alquiler de Salas", path: "/admin/rentals" },
    { label: "Reportes", path: "/admin/reports" },
  ],

  GENERAL_MANAGER: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Empleados", path: "/admin/employees" },
    { label: "Reportes", path: "/admin/reports" },
  ],

  CINEMA_MANAGER: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Empleados", path: "/admin/employees" },
    { label: "Funciones", path: "/admin/functions" },
    { label: "Reportes", patch: "/admin/reports" },
  ],

  CASHIER: [{ label: "Caja", path: "/ticketOffice/dashboard" }],

  USHER: [{ label: "Control de entradas", path: "/usher/control" }],
};
