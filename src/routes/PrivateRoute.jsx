import { Navigate } from "react-router-dom";

function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" />;
  }

  if (role && user.roleCode !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;
