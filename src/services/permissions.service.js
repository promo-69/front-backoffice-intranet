import api from "../api/axios.js";

export async function getAllPermissions({ page = 1, limit = 100 } = {}) {
  const { data } = await api.get("/permissions", {
    params: {
      page,
      limit,
    },
  });

  return data;
}

export async function getAllPermissionsPaginated({ limit = 100 } = {}) {
  let allPermissions = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await getAllPermissions({ page: currentPage, limit });
    const pageData = response?.data || response;
    const metadata = response?.metadata;

    if (Array.isArray(pageData)) {
      allPermissions = [...allPermissions, ...pageData];
    } else if (Array.isArray(pageData?.rows)) {
      allPermissions = [...allPermissions, ...pageData.rows];
    }

    const totalPages = metadata?.total_pages ?? 1;
    const nextPage = metadata?.next_page ?? null;

    if (nextPage && currentPage < totalPages) {
      currentPage = nextPage;
    } else {
      hasMorePages = false;
    }
  }

  return allPermissions;
}
