import { useState, useEffect, useCallback } from "react";
import {
  getDashboard,
  getDashboardByCinema,
  getChart,
  getChartByCinema,
} from "@/services/reports.service";

/**
 * Hook centralizado para el dashboard de reportes.
 * Maneja carga, error, filtros y refresco manual.
 */
export function useDashboard({ cinemaId, from, to } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const result = cinemaId
        ? await getDashboardByCinema(cinemaId, params)
        : await getDashboard(params);

      setData(result);
    } catch (e) {
      setError(e?.response?.data?.message || "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, [cinemaId, from, to]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useChartData({
  cinemaId,
  reportType,
  from,
  to,
  groupBy,
  channel,
} = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!reportType) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (groupBy) params.groupBy = groupBy;
      if (channel) params.channel = channel;

      const result = cinemaId
        ? await getChartByCinema(cinemaId, reportType, params)
        : await getChart(reportType, params);

      setData(result);
    } catch (e) {
      setError(e?.response?.data?.message || "Error al cargar el gráfico");
    } finally {
      setLoading(false);
    }
  }, [cinemaId, reportType, from, to, groupBy, channel]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
