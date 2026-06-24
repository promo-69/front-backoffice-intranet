import api from "@/api/axios";

const BASE = "/invoices";

const p = (params = {}, cinemaId) => {
  const out = { ...params };
  if (cinemaId) out.cinemaId = cinemaId;
  return out;
};

// ── Listado con filtros ─────────────────────────────────────────────────────

export const getInvoices = (params = {}, cinemaId) =>
  api.get(BASE, { params: p(params, cinemaId) }).then((r) => r.data.data);

// Shorthand: solo facturas anuladas/canceladas (usa GET /invoices/voided del backend)
export const getVoidedInvoices = (params = {}, cinemaId) =>
  api.get(`${BASE}/voided`, { params: p(params, cinemaId) }).then((r) => r.data.data);

// ── Detalle completo ────────────────────────────────────────────────────────

export const getInvoiceById = (id, cinemaId) =>
  api
    .get(`${BASE}/${id}`, { params: p({}, cinemaId) })
    .then((r) => r.data.data);

// ── PDF — preview inline (abre en nueva pestaña para ver e imprimir) ───────

export const getInvoicePdfUrl = (id, cinemaId, disposition = "inline") => {
  const params = new URLSearchParams(p({ disposition }, cinemaId));
  return `${api.defaults.baseURL}${BASE}/${id}/pdf?${params.toString()}`;
};

// Descarga forzada del PDF (botón "Descargar" en la fila/detalle)
export const downloadInvoicePdf = async (id, invoiceNumber, cinemaId) => {
  const response = await api.get(`${BASE}/${id}/pdf`, {
    params: p({ disposition: "attachment" }, cinemaId),
    responseType: "blob",
  });

  const contentType = response.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await response.data.text();
    const errorData = JSON.parse(text);
    throw new Error(errorData.message || "Error al exportar la factura");
  }

  const url = URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Anulación ────────────────────────────────────────────────────────────────

export const voidInvoice = (id, reason, cinemaId) =>
  api
    .delete(`${BASE}/${id}/void`, {
      data: { reason },
      params: p({}, cinemaId),
    })
    .then((r) => r.data);
