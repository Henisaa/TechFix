import ServiceUnavailable from '../components/ui/ServiceUnavailable';
import { FiPackage, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Inventario = () => {
  const { user } = useAuth();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FiPackage className="text-primary" /> Inventario de Repuestos
          </h1>
          <p className="text-slate-600 mt-2">Gestión de stock y piezas para reparación</p>
        </div>

        {user && ['ADMIN', 'TECNICO'].includes(user.role) && (
          <button 
            disabled
            className="flex items-center gap-2 bg-slate-300 text-slate-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
          >
            <FiPlus /> Agregar repuesto
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 opacity-60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre Repuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio CLP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="max-w-md mx-auto">
                    <ServiceUnavailable 
                      serviceName="Inventario"
                      expectedPort={8082}
                      plannedEndpoints={[
                        "GET /repuesto/ver/{id}",
                        "POST /repuesto/nuevo/{id}",
                        "PUT /repuesto/alterar/{id}"
                      ]}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
