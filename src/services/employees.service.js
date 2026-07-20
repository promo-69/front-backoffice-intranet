import api from "@/api/axios";

export const createEmployee = async (payload) => {
  const res = await api.post("/employees", payload);
  return res.data;
};

function normalizeEmployee(emp) {
  const person = emp.person || {};
  const positions = emp.employee?.positions || [];
  const firstPos =
    positions.find((p) => p.is_active) ||
    positions.find((p) => p.end_date == null) ||
    positions[positions.length - 1] ||
    {};
  const jobTitle = firstPos?.job_position?.title || "";
  return {
    ...emp,
    id: emp.employee?.id,
    people: {
      id: person.id,
      first_name: person.first_name,
      last_name: person.last_name,
      document_number: person.document_number,
      gender: person.gender,
      phone_number: person.phone_number,
      personal_email: person.personal_email,
      birth_date: person.birth_date,
    },
    _User: emp.user
      ? {
          ...emp.user,
          status: emp.user.is_active === false ? 0 : 1,
          _Roles: jobTitle
            ? { code: jobTitle.toUpperCase().replace(/ /g, "_") }
            : null,
        }
      : null,
    _cinema_name: firstPos?.cinema?.name || null,
    job_position: firstPos?.job_position?.id || null,
    cinema: firstPos?.cinema?.id || null,
    salary_base: firstPos?.salary_base || null,
    start_date: firstPos?.start_date || null,
  };
}

export const getEmployees = async (params = {}) => {
  const defaultParams = { _t: Date.now() };
  if (params.limit === undefined && params.page === undefined) {
    defaultParams.limit = -1;
  }
  const res = await api.get("/employees", {
    params: { ...defaultParams, ...params },
  });

  const data = res.data.data;
  const rows = Array.isArray(data) ? data : (data?.rows ?? []);
  return rows.map(normalizeEmployee);
};

export const getEmployeeById = async (id) => {
  const res = await api.get(`/employees/${id}`);
  return res.data.data;
};

export const updateEmployee = async (id, payload) => {
  const res = await api.patch(`/employees/${id}`, payload);
  return res.data;
};

export const changeEmployeePosition = async (id, payload) => {
  return api.patch(`/employees/${id}/position`, payload);
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};
