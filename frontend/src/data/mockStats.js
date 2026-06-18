const now = new Date();

function monthsAgo(n) {
  return new Date(now.getFullYear(), now.getMonth() - n, 1);
}

function dateIn(monthOffset, day) {
  const base = monthsAgo(monthOffset);
  return new Date(base.getFullYear(), base.getMonth(), day).toISOString();
}

export const MOCK_COMUNAS = [
  { comuna: 'Santiago', total: 34, completadas: 18, enProceso: 10, pendientes: 6 },
  { comuna: 'Providencia', total: 21, completadas: 14, enProceso: 5, pendientes: 2 },
  { comuna: 'Las Condes', total: 17, completadas: 10, enProceso: 4, pendientes: 3 },
  { comuna: 'Maipú', total: 15, completadas: 9, enProceso: 3, pendientes: 3 },
  { comuna: 'La Florida', total: 12, completadas: 7, enProceso: 3, pendientes: 2 },
  { comuna: 'Pudahuel', total: 9, completadas: 5, enProceso: 2, pendientes: 2 },
  { comuna: 'Ñuñoa', total: 8, completadas: 5, enProceso: 2, pendientes: 1 },
  { comuna: 'Peñalolén', total: 6, completadas: 4, enProceso: 1, pendientes: 1 },
];

export const MOCK_RAW_ORDENES = [
  { id: 'm-ord-1', clienteUsername: 'cliente.mock1', montoTotal: 89990, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(0, 4) },
  { id: 'm-ord-2', clienteUsername: 'cliente.mock2', montoTotal: 125000, metodoPago: 'CREDITO', estadoOrden: 'PAGADO', createdAt: dateIn(0, 9) },
  { id: 'm-ord-3', clienteUsername: 'cliente.mock3', montoTotal: 47500, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(0, 15) },
  { id: 'm-ord-4', clienteUsername: 'cliente.mock4', montoTotal: 210000, metodoPago: 'CREDITO', estadoOrden: 'PAGADO', createdAt: dateIn(0, 22) },
  { id: 'm-ord-5', clienteUsername: 'cliente.mock5', montoTotal: 63000, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(1, 3) },
  { id: 'm-ord-6', clienteUsername: 'cliente.mock6', montoTotal: 98500, metodoPago: 'CREDITO', estadoOrden: 'PAGADO', createdAt: dateIn(1, 11) },
  { id: 'm-ord-7', clienteUsername: 'cliente.mock7', montoTotal: 175000, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(1, 18) },
  { id: 'm-ord-8', clienteUsername: 'cliente.mock8', montoTotal: 52000, metodoPago: 'CREDITO', estadoOrden: 'PAGADO', createdAt: dateIn(1, 25) },
  { id: 'm-ord-9', clienteUsername: 'cliente.mock9', montoTotal: 310000, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(2, 6) },
  { id: 'm-ord-10', clienteUsername: 'cliente.mock10', montoTotal: 84000, metodoPago: 'CREDITO', estadoOrden: 'PAGADO', createdAt: dateIn(2, 14) },
  { id: 'm-ord-11', clienteUsername: 'cliente.mock11', montoTotal: 140000, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(2, 20) },
  { id: 'm-ord-12', clienteUsername: 'cliente.mock12', montoTotal: 67500, metodoPago: 'CREDITO', estadoOrden: 'PAGADO', createdAt: dateIn(3, 5) },
  { id: 'm-ord-13', clienteUsername: 'cliente.mock13', montoTotal: 229000, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(3, 13) },
  { id: 'm-ord-14', clienteUsername: 'cliente.mock14', montoTotal: 95000, metodoPago: 'CREDITO', estadoOrden: 'PAGADO', createdAt: dateIn(3, 21) },
  { id: 'm-ord-15', clienteUsername: 'cliente.mock15', montoTotal: 158000, metodoPago: 'DEBITO', estadoOrden: 'PAGADO', createdAt: dateIn(3, 28) },
];

export const MOCK_RAW_PAGOS = [
  { id: 'm-pago-1', idVisitaTecnica: 'm-cita-1', monto: 45000, metodoPago: 'DEBITO', estadoPago: 'PAGADO', fechaPago: dateIn(0, 5), _mockComuna: 'Santiago' },
  { id: 'm-pago-2', idVisitaTecnica: 'm-cita-2', monto: 75000, metodoPago: 'CREDITO', estadoPago: 'PAGADO', fechaPago: dateIn(0, 10), _mockComuna: 'Providencia' },
  { id: 'm-pago-3', idVisitaTecnica: 'm-cita-3', monto: 30000, metodoPago: 'EFECTIVO', estadoPago: 'PAGADO', fechaPago: dateIn(0, 16), _mockComuna: 'Las Condes' },
  { id: 'm-pago-4', idVisitaTecnica: 'm-cita-4', monto: 120000, metodoPago: 'CREDITO', estadoPago: 'PAGADO', fechaPago: dateIn(0, 23), _mockComuna: 'Maipú' },
  { id: 'm-pago-5', idVisitaTecnica: 'm-cita-5', monto: 55000, metodoPago: 'DEBITO', estadoPago: 'PAGADO', fechaPago: dateIn(1, 4), _mockComuna: 'La Florida' },
  { id: 'm-pago-6', idVisitaTecnica: 'm-cita-6', monto: 90000, metodoPago: 'CREDITO', estadoPago: 'PAGADO', fechaPago: dateIn(1, 12), _mockComuna: 'Santiago' },
  { id: 'm-pago-7', idVisitaTecnica: 'm-cita-7', monto: 40000, metodoPago: 'EFECTIVO', estadoPago: 'PAGADO', fechaPago: dateIn(1, 19), _mockComuna: 'Pudahuel' },
  { id: 'm-pago-8', idVisitaTecnica: 'm-cita-8', monto: 65000, metodoPago: 'DEBITO', estadoPago: 'PAGADO', fechaPago: dateIn(1, 26), _mockComuna: 'Ñuñoa' },
  { id: 'm-pago-9', idVisitaTecnica: 'm-cita-9', monto: 150000, metodoPago: 'CREDITO', estadoPago: 'PAGADO', fechaPago: dateIn(2, 7), _mockComuna: 'Las Condes' },
  { id: 'm-pago-10', idVisitaTecnica: 'm-cita-10', monto: 35000, metodoPago: 'EFECTIVO', estadoPago: 'PAGADO', fechaPago: dateIn(2, 15), _mockComuna: 'Providencia' },
  { id: 'm-pago-11', idVisitaTecnica: 'm-cita-11', monto: 80000, metodoPago: 'DEBITO', estadoPago: 'PAGADO', fechaPago: dateIn(2, 21), _mockComuna: 'Peñalolén' },
  { id: 'm-pago-12', idVisitaTecnica: 'm-cita-12', monto: 110000, metodoPago: 'CREDITO', estadoPago: 'PAGADO', fechaPago: dateIn(3, 6), _mockComuna: 'Santiago' },
  { id: 'm-pago-13', idVisitaTecnica: 'm-cita-13', monto: 48000, metodoPago: 'DEBITO', estadoPago: 'PAGADO', fechaPago: dateIn(3, 14), _mockComuna: 'Maipú' },
  { id: 'm-pago-14', idVisitaTecnica: 'm-cita-14', monto: 95000, metodoPago: 'CREDITO', estadoPago: 'PAGADO', fechaPago: dateIn(3, 22), _mockComuna: 'Las Condes' },
  { id: 'm-pago-15', idVisitaTecnica: 'm-cita-15', monto: 60000, metodoPago: 'EFECTIVO', estadoPago: 'PAGADO', fechaPago: dateIn(3, 29), _mockComuna: 'La Florida' },
];
