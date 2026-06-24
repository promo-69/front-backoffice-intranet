PERMISSIONS
===========

Overview
--------
This document explains the frontend permission primitives used across the app and how to apply them consistently.

Key concepts
------------
- Permissions are normalized strings (trimmed, UPPERCASE) like `CRUD:CREATE:USERS`.
- The backend is the source of truth. The frontend only controls visibility/UX.
- `SUPER_ADMIN` role bypasses checks in the frontend (`isSuperAdmin`).

Auth context
------------
- `AuthContext` exposes `user`, `permissionsSet`, and `hasPermission(permission)`.
- `permissionsSet` is a `Set` of normalized permissions for fast checks.

Helpers & components
--------------------
- `usePermission()` (hook)
  - `can(permission)` → boolean
  - `canAny([p1,p2])` → boolean (OR)
  - `canAll([p1,p2])` → boolean (AND)
  - `isSuperAdmin` → boolean
  - `hasRole([roles])` → boolean

- `IfPermission` (view-level)
  - Use to hide whole controls, menu items or sections.
  - Example: `<IfPermission permission="CRUD:READ:USERS">...</IfPermission>`

- `DisableIfNoPermission` (action-level)
  - Use to disable buttons/inputs while keeping layout stable.
  - Accepts `permission`, `anyOf` (OR), or `allOf` (AND) and optional `title` tooltip.
  - If allowed, returns `children` unchanged. If not, clones `children` and sets `disabled/aria-disabled/title`.
  - Example: `<DisableIfNoPermission permission="CRUD:DELETE:USERS"> <button>Delete</button> </DisableIfNoPermission>`

Patterns and examples
---------------------
- Hide navigation items (IfPermission):

  - `IfPermission` is appropriate when you must not show a route or menu entry at all.

- Disable inline actions (DisableIfNoPermission):

  - Use on table action buttons and form submit buttons so non-authorized users see the action but cannot trigger it.
  - Provides a tooltip explaining the restriction.

SUPER_ADMIN
-----------
- The frontend treats a user with `role === "SUPER_ADMIN"` as allowed for all checks.
- Keep the same canonical string as backend or coordinate with backend team.

Security notes
--------------
- Frontend checks are UX-only. Always enforce permissions server-side.
- Don't embed sensitive data in the UI if the backend would reject the request.

Developer checklist
-------------------
- Add new permission names to backend and communicate them to frontend.
- Use `usePermission().can(...)` in non-UI logic (e.g., disabling a form submit handler).
- Use `IfPermission` for routes and navigation; `DisableIfNoPermission` for buttons and inputs.
- Add unit tests for new permission-aware components.

Where to find code
------------------
- `src/context/AuthContext.jsx`
- `src/hooks/usePermission.js`
- `src/components/ui/IfPermission.jsx`
- `src/components/ui/DisableIfNoPermission.jsx`
- `src/routes/ProtectedRoute.jsx`

Contact
-------
If unsure about permission names, coordinate with backend and add the mapping in `src/lib/route-permissions.js`.
