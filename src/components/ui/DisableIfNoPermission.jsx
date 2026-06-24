import React from "react";
import { usePermission } from "@/hooks/usePermission";

export default function DisableIfNoPermission({ permission, anyOf, allOf, children, title }) {
  const { can, canAny, canAll } = usePermission();

  let allowed = true;
  if (permission) allowed = can(permission);
  else if (Array.isArray(anyOf) && anyOf.length) allowed = canAny(anyOf);
  else if (Array.isArray(allOf) && allOf.length) allowed = canAll(allOf);

  // If allowed, render children unchanged
  if (allowed) return children;

  // If not allowed, try to clone and disable common interactive elements
  if (!React.isValidElement(children)) return children;

  const props = {};
  // mark disabled for form controls
  if (typeof children.props.disabled !== "undefined") props.disabled = true;
  // add aria-disabled for non-form elements
  props["aria-disabled"] = true;
  // add title/tooltip to explain why it's disabled
  if (title) props.title = title;
  else props.title = "No tienes permiso para realizar esta acción";

  return React.cloneElement(children, props);
}
