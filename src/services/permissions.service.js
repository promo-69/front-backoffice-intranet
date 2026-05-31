import api from "../api/axios.js";

export async function getAllPermissions() {
  
  const { data } = await api.get("/permissions", {
    params: {
      page: 1,
      limit: 100,
    },
  });
  return data.data.rows;
}












{
  /* 
// import api from "../api/axios.js";

export async function getAllPermissions() {
  const { data } = await api.get("/permissions");
  return data.data.rows; 
}
*/
}
