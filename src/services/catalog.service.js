import api from "@/api/axios";

const CATALOG_FALLBACKS = {
  "genres": [
    { id: 1, description: "Acción" },
    { id: 2, description: "Comedia" },
    { id: 3, description: "Drama" },
    { id: 4, description: "Ciencia Ficción" },
    { id: 5, description: "Terror / Suspenso" },
    { id: 6, description: "Animación / Infantil" }
  ],
  "age-classifications": [
    { id: 1, description: "A (Todo Público)" },
    { id: 2, description: "B (+12)" },
    { id: 3, description: "C (+15)" },
    { id: 4, description: "D (+18)" }
  ],
  "movie-lifecycle-states": [
    { id: 1, description: "Próximamente" },
    { id: 2, description: "En Cartelera (Estreno)" },
    { id: 3, description: "En Cartelera (Regular)" },
    { id: 4, description: "Últimos Días" },
    { id: 5, description: "Fuera de Cartelera" }
  ],
  "projection-types": [
    { id: 1, description: "2D Tradicional" },
    { id: 2, description: "3D Dolby Atmos" },
    { id: 3, description: "4DX Dynamic" }
  ],
  "currencies": [
    { id: 1, description: "USD - Dólares", symbol: "$" },
    { id: 2, description: "VES - Bolívares", symbol: "Bs" }
  ]
};
// Catálogos que tienen endpoints específicos en el backend
const CATALOG_API_ROUTES = {
  
};

function hasSpecialRoute(catalogName) {
  return CATALOG_API_ROUTES[catalogName];
}

function getRoute(catalogName) {
  return CATALOG_API_ROUTES[catalogName].base;
}

// MOCK LOCAL TEMPORAL: Simula lo que Bruno debería responder eventualmente
const MOCK_ROOM_BOOKINGS = [
  { id: 1, room_id: 1, time_slot: "14:00 - 16:30", status: "confirmed" },
  { id: 2, room_id: 1, time_slot: "17:00 - 19:30", status: "confirmed" },
  { id: 3, room_id: 2, time_slot: "15:00 - 17:30", status: "confirmed" },
  { id: 4, room_id: 3, time_slot: "18:30 - 21:00", status: "confirmed" },
  { id: 5, room_id: 4, time_slot: "20:00 - 22:30", status: "confirmed" }
];
// Listar todos los catálogos disponibles (manejando la paginación del backend)
export const getAvailableCatalogs = async () => {
  try {
    let allCatalogs = [];
    let currentPage = 1;
    let totalPages = 1;

    // Hacemos el primer llamado para saber cuántas páginas hay
    const firstResponse = await api.get("/catalogs?page=1");
    if (firstResponse.data && firstResponse.data.data) {
      allCatalogs = [...firstResponse.data.data];
      totalPages = firstResponse.data.metadata.total_pages;

      // Si hay más páginas, las pedimos todas
      for (let i = 2; i <= totalPages; i++) {
        const nextResponse = await api.get(`/catalogs?page=${i}`);
        if (nextResponse.data && nextResponse.data.data) {
          allCatalogs = [...allCatalogs, ...nextResponse.data.data];
        }
      }
    }

    return { data: allCatalogs };
  } catch (error) {
    console.error("Error fetching all catalogs:", error);
    // Fallback por si falla el bucle
    const response = await api.get("/catalogs");
    return response.data;
  }
};

// Obtener los registros de un catálogo específico
export const getCatalogRecords = async (catalogName, page = 1) => {
  if (hasSpecialRoute(catalogName)) {
    const response = await api.get(getRoute(catalogName));
    
    const list = Array.isArray(response.data) ? response.data : response.data.data || [];
    
    return {
      data: list,
      metadata: {
        total: list.length,
        per_page: list.length,
        current_page: 1,
        total_pages: 1,
        next_page: null,
        prev_page: null
      }
    };
  }
  const response = await api.get(`/catalogs/${catalogName}?page=${page}`);
  return response.data; 
};

export const getCatalogByName = async (catalogName) => {
  const response = await api.get(`/catalogs/${catalogName}?page=1&per-page=100`);
  return response.data.data;
};

// Obtener la metadata de un catálogo específico (para saber qué campos tiene)
export const getCatalogMetadata = async (catalogName) => {
  if (hasSpecialRoute(catalogName)) {
    return { data: CATALOG_API_ROUTES[catalogName].metadata };
  }
  const response = await api.get(`/catalogs/${catalogName}/metadata`);
  return response.data;
};
 
// Crear un registro en un catálogo
export const createCatalogRecord = async (catalogName, data) => {
  if (hasSpecialRoute(catalogName)) {
    const response = await api.post(getRoute(catalogName), data);
    return response.data;
  }
  const response = await api.post(`/catalogs/${catalogName}`, data);
  return response.data;
};

// Actualizar un registro en un catálogo
export const updateCatalogRecord = async (catalogName, id, data) => {
  if (hasSpecialRoute(catalogName)) {
    const response = await api.put(`${getRoute(catalogName)}/${id}`, data);
    return response.data;
  }
  const response = await api.patch(`/catalogs/${catalogName}/${id}`, data);
  return response.data;
};

// Eliminar un registro en un catálogo
export const deleteCatalogRecord = async (catalogName, id) => {
  if (hasSpecialRoute(catalogName)) {
    const response = await api.delete(`${getRoute(catalogName)}/${id}`);
    return response.data;
  }
  const response = await api.delete(`/catalogs/${catalogName}/${id}`);
  return response.data;
};

// Restaurar un registro en un catálogo (si aplica soft delete)
export const restoreCatalogRecord = async (catalogName, id) => {
  if (hasSpecialRoute(catalogName)) {
    const response = await api.patch(`${getRoute(catalogName)}/${id}/restore`);
    return response.data;
  }
  const response = await api.patch(`/catalogs/${catalogName}/${id}/restore`);
  return response.data;
};
