import ServiceUnavailable from '../components/ui/ServiceUnavailable';
import { FiCalendar, FiClock } from 'react-icons/fi';

const Agendamiento = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FiCalendar className="text-primary" /> Agendamiento
        </h1>
        <p className="text-slate-600 mt-2">Solicita una visita técnica para tu equipo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">

          <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6">
            <ServiceUnavailable 
              serviceName="Agendamiento"
              expectedPort={8083}
              plannedEndpoints={[
                "POST /agendar/nuevo/{id}",
                "GET /agendar/ver/{id}",
                "DELETE /agendar/eliminar/{id}"
              ]}
            />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            📅 Formulario de Solicitud
          </h2>

          <form className="space-y-6 opacity-40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input disabled type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input disabled type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Equipo</label>
              <select disabled className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-100">
                <option>PC de Escritorio</option>
                <option>Laptop / Notebook</option>
                <option>Celular / Smartphone</option>
                <option>Tablet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Problema</label>
              <textarea disabled rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-100"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Preferida</label>
              <input disabled type="date" className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-100" />
            </div>

            <button disabled type="button" className="w-full bg-slate-300 text-slate-500 font-bold py-3 px-8 rounded-xl cursor-not-allowed">
              Solicitar Hora
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FiClock className="text-primary" /> Mis Reservas
          </h2>

          <div className="text-center py-10 text-slate-500">
            <div className="text-4xl mb-3 flex justify-center text-slate-300">📅</div>
            <p>Servicio no disponible temporalmente.</p>
            <p className="text-sm mt-2">Tus reservas aparecerán aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agendamiento;
