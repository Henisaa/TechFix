const StatusBadge = ({ status }) => {
  let colorClass = 'bg-slate-100 text-slate-800';
  let dotClass = 'bg-slate-500';

  if (status === 'PAGADO') {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
    dotClass = 'bg-green-500';
  } else if (status === 'PENDIENTE') {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    dotClass = 'bg-yellow-500';
  } else if (status === 'ANULADO') {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
    dotClass = 'bg-red-500';
  }

  else if (status === 'ACTIVO' || status === true) {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
    dotClass = 'bg-green-500';
    status = 'ACTIVO';
  } else if (status === 'INACTIVO' || status === false) {
    colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
    dotClass = 'bg-gray-500';
    status = 'INACTIVO';
  }

  else if (status === 'EN_DIAGNOSTICO') {
    colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    dotClass = 'bg-blue-500';
  } else if (status === 'ESPERANDO_REPUESTO') {
    colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
    dotClass = 'bg-orange-500';
  } else if (status === 'EN_REPARACION') {
    colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
    dotClass = 'bg-purple-500';
  } else if (status === 'RETIRO_MDM_COMPLETADO') {
    colorClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
    dotClass = 'bg-indigo-500';
  } else if (status === 'FINALIZADA') {
    colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    dotClass = 'bg-emerald-500';
  } else if (status === 'ENTREGADA') {
    colorClass = 'bg-teal-100 text-teal-800 border-teal-200';
    dotClass = 'bg-teal-500';
  }

  else if (status === 'ADMIN') {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
    dotClass = 'bg-red-500';
  } else if (status === 'TECNICO') {
    colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
    dotClass = 'bg-orange-500';
  } else if (status === 'USER') {
    colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    dotClass = 'bg-blue-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
