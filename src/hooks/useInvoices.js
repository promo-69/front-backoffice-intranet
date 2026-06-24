import { useState, useEffect, useCallback } from "react";
import {
  getInvoices,
  getInvoiceById,
  voidInvoice as voidInvoiceApi,
} from "@/services/invoices.service";

export function useInvoices({
  cinemaId,
  from,
  to,
  search,
  employeeId,
  status = "all",
  page = 1,
  limit = 20,
} = {}) {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit, status };
      if (from) params.from = from;
      if (to) params.to = to;
      if (search) params.search = search;
      if (employeeId) params.employeeId = employeeId;

      const result = await getInvoices(params, cinemaId);
      setInvoices(result.invoices ?? []);
      setPagination(result.pagination ?? { page, limit, total: 0 });
    } catch (e) {
      setError(e?.response?.data?.message || "Error al cargar las facturas");
    } finally {
      setLoading(false);
    }
  }, [cinemaId, from, to, search, employeeId, status, page, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { invoices, pagination, loading, error, refetch: fetch };
}

export function useInvoiceDetail(id, cinemaId) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setInvoice(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setInvoice(await getInvoiceById(id, cinemaId));
    } catch (e) {
      setError(e?.response?.data?.message || "Error al cargar la factura");
    } finally {
      setLoading(false);
    }
  }, [id, cinemaId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { invoice, loading, error, refetch: fetch };
}

export function useVoidInvoice() {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (id, reason, cinemaId) => {
    setLoading(true);
    try {
      await voidInvoiceApi(id, reason, cinemaId);
    } finally {
      setLoading(false);
    }
  }, []);

  return { voidInvoice: run, loading };
}
