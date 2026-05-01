import { useState } from 'react';
import ServiceUnavailable from '../components/ui/ServiceUnavailable';
import { FiSearch, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Ordenes = () => {
  const [searchId, setSearchId] = useState('');
  const { user } = useAuth();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
          <FiActivity className="text-primary" /> Estado de tu Reparación
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Ingresa el ID de tu orden para conocer el estado actual de tu equipo.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 md:p-12 relative overflow-hidden mb-8">

        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[4px] z-10 flex items-center justify-center p-6">
          <div className="max-w-lg w-full shadow-2xl rounded-2xl overflow-hidden">
            <ServiceUnavailable 
              serviceName="Órdenes de Reparación"
              expectedPort={8084}
              plannedEndpoints={[
                "POST /orden/nueva/{id}",
                "GET /orden/ver/{id}"
              ]}
            />
          </div>
        </div>

        <form className="max-w-2xl mx-auto flex gap-4 mb-12 opacity-30 pointer-events-none">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Ej: ORD-2024-1025"
              className="w-full px-4 py-4 pl-12 border-2 border-slate-300 rounded-2xl bg-slate-50 text-lg"
              disabled
            />
          </div>
          <button
            type="button"
            disabled
            className="bg-primary text-white font-bold py-4 px-8 rounded-2xl"
          >
            Buscar
          </button>
        </form>

        <div className="opacity-30 pointer-events-none border-t border-slate-200 pt-12">
          <h3 className="text-xl font-bold text-slate-800 mb-8 text-center">Ejemplo de Timeline de Estado</h3>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="h-1 w-full bg-slate-200 rounded-full"></div>
            </div>
            <div className="relative flex justify-between">
              <TimelineStep status="EN_DIAGNOSTICO" label="Diagnóstico" active={true} />
              <TimelineStep status="ESPERANDO_REPUESTO" label="Repuestos" active={true} />
              <TimelineStep status="EN_REPARACION" label="En Reparación" active={false} isCurrent={true} />
              <TimelineStep status="FINALIZADA" label="Finalizada" active={false} />
              <TimelineStep status="ENTREGADA" label="Entregada" active={false} />
            </div>
          </div>
        </div>
      </div>

      {user && ['ADMIN', 'TECNICO'].includes(user.role) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 opacity-60">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Panel Técnico (Próximamente)</h2>
          <p className="text-slate-500 mb-4">Aquí verás la lista de todas las órdenes activas y podrás cambiar su estado.</p>
          <div className="h-32 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
            <span className="text-slate-400 font-medium">Tabla de órdenes en construcción...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const TimelineStep = ({ label, active, isCurrent }) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center border-4 ${
        active ? 'bg-primary border-primary text-white' : 
        isCurrent ? 'bg-white border-primary text-primary shadow-[0_0_0_4px_rgba(30,64,175,0.2)]' : 
        'bg-white border-slate-300 text-slate-300'
      } z-10`}>
        {active && <span className="text-sm">✓</span>}
      </div>
      <span className={`mt-3 text-sm font-medium ${
        active || isCurrent ? 'text-slate-900' : 'text-slate-400'
      }`}>
        {label}
      </span>
    </div>
  );
};

export default Ordenes;
