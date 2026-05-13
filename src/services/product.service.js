import api from "@/api/axios";

// Obtener todos los productos de dulcería
export const getProducts = async (page = 1) => {
  const response = await api.get('/concessions/products', {
    params: { page }
  });
  return response.data;
};

// Obtener un producto por ID
export const getProductById = async (id) => {
  const response = await api.get(`/concessions/products/${id}`);
  return response.data;
};

// Crear un producto
export const createProduct = async (payload) => {
  const response = await api.post("/concessions/products", payload);
  return response.data;
};

// Actualizar un producto
export const updateProduct = async (id, payload) => {
  const response = await api.put(`/concessions/products/${id}`, payload);
  return response.data;
};
