import api from "../api/axios.js";

export async function getAllPermissions() {
  const { data } = await api.get("/permissions");
  return data.data.rows; 
}
