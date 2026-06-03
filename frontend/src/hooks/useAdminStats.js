import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../services/api';

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

export const useAdminStats = (offset = 0) => {
  const [piezasData, setPiezasData] = useState([]);
  const [ordenesData, setOrdenesData] = useState([]);
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

      const ordenes = carritoRes.status === 'fulfilled' ? (carritoRes.value.data || []) : [];
      const pagos = pagosRes.status === 'fulfilled' ? (pagosRes.value.data || []) : [];

      const piezasFiltered = ordenes.filter((o) => o.estadoOrden === 'PAGADO');
      const pagosFiltered = pagos.filter((p) => p.estadoPago === 'PAGADO');

      setPiezasData(groupByMonth(piezasFiltered, 'createdAt', 'montoTotal', currentMonths));
      setOrdenesData(groupByMonth(pagosFiltered, 'fechaPago', 'monto', currentMonths));
    } catch {
      setPiezasData(currentMonths.map((m) => ({ label: m.label, value: 0 })));
      setOrdenesData(currentMonths.map((m) => ({ label: m.label, value: 0 })));
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { piezasData, ordenesData, months, loading, refetch: fetchStats };
};
