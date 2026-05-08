const STATUS_MAP = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'bg-yellow-100 text-yellow-800' },
  PAGADO:     { label: 'Pagado',     cls: 'bg-green-100 text-green-800'  },
  ANULADO:    { label: 'Anulado',    cls: 'bg-red-100 text-red-800'      },
  EN_PROCESO: { label: 'En Proceso', cls: 'bg-orange-100 text-orange-800'},
  COMPLETADA: { label: 'Completada', cls: 'bg-green-100 text-green-800'  },
  CANCELADA:  { label: 'Cancelada',  cls: 'bg-red-100 text-red-800'      },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] || { label: status, cls: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
