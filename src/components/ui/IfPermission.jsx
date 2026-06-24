import React from "react";
import { usePermission } from "@/hooks/usePermission";

export default function IfPermission({ permission, anyOf, allOf, children, fallback = null }) {
  const { can, canAny, canAll } = usePermission();

  let allowed = true;
  if (permission) {
    allowed = can(permission);
  } else if (Array.isArray(anyOf) && anyOf.length) {
    allowed = canAny(anyOf);
  } else if (Array.isArray(allOf) && allOf.length) {
    allowed = canAll(allOf);
  }

  return allowed ? children : fallback;
}
