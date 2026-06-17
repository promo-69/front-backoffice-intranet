import { useState, useEffect, useCallback } from 'react';
import { getDashboard, getChart } from '@/services/reports.service';

export function useDashboard({ cinemaId, from, to } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to)   params.to   = to;
      // cinemaId undefined → backend devuelve vista global o usa cinemaId del JWT
      setData(await getDashboard(params, cinemaId));
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [cinemaId, from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useChartData({ cinemaId, reportType, from, to, groupBy, channel } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!reportType) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (from)    params.from    = from;
      if (to)      params.to      = to;
      if (groupBy) params.groupBy = groupBy;
      if (channel) params.channel = channel;
      setData(await getChart(reportType, params, cinemaId));
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al cargar el gráfico');
    } finally {
      setLoading(false);
    }
  }, [cinemaId, reportType, from, to, groupBy, channel]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
