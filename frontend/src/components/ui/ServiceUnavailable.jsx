import { FiWrench } from 'react-icons/fi';

const ServiceUnavailable = ({ serviceName, expectedPort, plannedEndpoints }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md border border-amber-200">
      <div className="bg-amber-100 text-amber-600 p-4 rounded-full mb-4">
        <FiWrench className="text-4xl" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        Módulo de {serviceName} en desarrollo
      </h2>
      <p className="text-slate-600 text-center mb-6 max-w-md">
        Este módulo estará disponible cuando el microservicio correspondiente esté activo.
      </p>

      <div className="bg-slate-50 w-full rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <span className="font-semibold text-slate-700">Estado del servicio:</span>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded border border-amber-200">
            Puerto {expectedPort} (Inactivo)
          </span>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Endpoints previstos:</h3>
          <ul className="space-y-2 font-mono text-sm">
            {plannedEndpoints && plannedEndpoints.map((endpoint, index) => {
              const method = endpoint.split(' ')[0];
              const path = endpoint.substring(method.length + 1);

              let methodColor = 'text-slate-500';
              if (method === 'GET') methodColor = 'text-blue-600 font-bold';
              if (method === 'POST') methodColor = 'text-green-600 font-bold';
              if (method === 'PUT') methodColor = 'text-orange-600 font-bold';
              if (method === 'DELETE') methodColor = 'text-red-600 font-bold';
              if (method === 'PATCH') methodColor = 'text-purple-600 font-bold';

              return (
                <li key={index} className="flex gap-2 p-2 bg-white rounded border border-slate-100">
                  <span className={`w-14 ${methodColor}`}>{method}</span>
                  <span className="text-slate-600">{path}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceUnavailable;
