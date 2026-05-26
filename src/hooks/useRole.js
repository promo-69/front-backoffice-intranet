import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useRole() {
  const { user } = useContext(AuthContext);

  const role = user?.role || null;

  return {
    role,
    isSuperAdmin: role === "SUPER_ADMIN",
    isGeneralManager: role === "GENERAL_MANAGER",
    isCinemaManager: role === "CINEMA_MANAGER",
    isCashier: role === "CASHIER",
    isUsher: role === "USHER",
    hasRole: (roles) => roles.includes(role),
  };
}
