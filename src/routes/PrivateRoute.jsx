import { Navigate } from "react-router-dom";

function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" />;
  }

  if (role) {
    const allowedRoles = {
      ADMIN: ["ADMIN", "SUPER_ADMIN", "CINEMA_MANAGER", "USHER"],
      CASHIER: ["CASHIER"],
    }[role] || [role];

    if (!allowedRoles.includes(user.roleCode)) {
      return <Navigate to="/" />;
    }
  }

  return children;
}

export default PrivateRoute;
