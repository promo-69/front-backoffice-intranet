import api from "../api/axios.js";

// Obtener todos los roles
export async function getRoles() {
  const { data } = await api.get("/roles");
  return data.data.rows; 
}

// Obtener un rol por ID
export async function getRoleById(roleId) {
  const { data } = await api.get(`/roles/${roleId}`);
  return data.data; 
}

// Obtener permisos asignados a un rol
export async function getRolePermissions(roleId) {
  const { data } = await api.get(`/roles/${roleId}/permissions`);
  return data.data.rows; 
}

// Asignar permisos a un rol
export async function updateRolePermissions(roleId, permissionsIds) {
  const { data } = await api.post(`/roles/${roleId}/permissions`, {
    permissions: permissionsIds,
  });
  return data;
}

// Crear un rol
export async function createRole(payload) {
  const { data } = await api.post("/roles", payload);
  return data.data;
}

// Actualizar un rol
export async function updateRole(roleId, payload) {
  const { data } = await api.put(`/roles/${roleId}`, payload);
  return data.data;
}

// Eliminar un rol
export async function deleteRole(roleId) {
  const { data } = await api.delete(`/roles/${roleId}`);
  return data;
}
