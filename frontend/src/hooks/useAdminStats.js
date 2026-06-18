import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../services/api';
import { MOCK_RAW_ORDENES, MOCK_RAW_PAGOS } from '../data/mockStats';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function parseDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function buildLast4Months(baseOffset = 0) {
  const now = new Date();
  const months = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + baseOffset, 1);
    months.push({
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      month: d.getMonth(),
      year: d.getFullYear(),
    });
  }
  return months;
}

function groupByMonth(items, dateField, amountField, months) {
  return months.map((m) => {
    const total = items
      .filter((item) => {
        const d = parseDate(item[dateField]);
        return d && d.getMonth() === m.month && d.getFullYear() === m.year;
      })
      .reduce((sum, item) => {
        const v = parseFloat(item[amountField] ?? 0);
        return sum + (isNaN(v) ? 0 : v);
      }, 0);
    return { label: m.label, value: Math.round(total) };
  });
}

function mergeUnique(realItems, mockItems, idField = 'id') {
  const realIds = new Set(realItems.map((i) => i[idField]));
  const extras = mockItems.filter((i) => !realIds.has(i[idField]));
  return [...realItems, ...extras];
}

export const useAdminStats = (offset = 0) => {
  const [piezasData, setPiezasData] = useState([]);
  const [ordenesData, setOrdenesData] = useState([]);
  const [rawOrdenes, setRawOrdenes] = useState([]);
  const [rawPagos, setRawPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState([]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const currentMonths = buildLast4Months(offset);
    setMonths(currentMonths);
    try {
      const [carritoRes, pagosRes] = await Promise.allSettled([
        paymentApi.get('/carrito/todas'),
        paymentApi.get('/lista'),
      ]);

      const realOrdenes = carritoRes.status === 'fulfilled' ? (carritoRes.value.data || []) : [];
      const realPagos = pagosRes.status === 'fulfilled' ? (pagosRes.value.data || []) : [];

      const realPagadas = realOrdenes.filter((o) => o.estadoOrden === 'PAGADO');
      const realPagosFiltrados = realPagos.filter((p) => p.estadoPago === 'PAGADO');

      const combinedOrdenes = mergeUnique(realPagadas, MOCK_RAW_ORDENES);
      const combinedPagos = mergeUnique(realPagosFiltrados, MOCK_RAW_PAGOS);

      setPiezasData(groupByMonth(combinedOrdenes, 'createdAt', 'montoTotal', currentMonths));
      setOrdenesData(groupByMonth(combinedPagos, 'fechaPago', 'monto', currentMonths));
      setRawOrdenes(combinedOrdenes);
      setRawPagos(combinedPagos);
    } catch {
      const combinedOrdenes = MOCK_RAW_ORDENES;
      const combinedPagos = MOCK_RAW_PAGOS;
      setPiezasData(groupByMonth(combinedOrdenes, 'createdAt', 'montoTotal', currentMonths));
      setOrdenesData(groupByMonth(combinedPagos, 'fechaPago', 'monto', currentMonths));
      setRawOrdenes(combinedOrdenes);
      setRawPagos(combinedPagos);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { piezasData, ordenesData, rawOrdenes, rawPagos, months, loading, refetch: fetchStats };
};
