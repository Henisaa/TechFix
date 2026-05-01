import { useState } from 'react';
import { usePagos } from '../hooks/usePagos';
import StatusBadge from '../components/ui/StatusBadge';
import { FiDollarSign, FiSearch, FiCreditCard, FiSave, FiXCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  if (price == null) return '';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price).replace('CLP', '').trim();
};

const Pagos = () => {
  const { pagoActivo, loading, crearPago, buscarPago, actualizarPago } = usePagos();
  const [activeTab, setActiveTab] = useState('registrar');

  const [formDataNuevo, setFormDataNuevo] = useState({
    idVisitaTecnica: '',
    monto: '',
    metodoPago: 'EFECTIVO',
    descripcion: '',
    fechaPago: new Date().toISOString().split('T')[0]
  });

  const [searchId, setSearchId] = useState('');
  const [formDataEdit, setFormDataEdit] = useState(null);

  const handleCrear = async (e) => {
    e.preventDefault();
    const result = await crearPago(formDataNuevo.idVisitaTecnica, {
      ...formDataNuevo,
      monto: parseFloat(formDataNuevo.monto)
    });

    if (result) {
      setFormDataNuevo({
        idVisitaTecnica: '',
        monto: '',
        metodoPago: 'EFECTIVO',
        descripcion: '',
        fechaPago: new Date().toISOString().split('T')[0]
      });

      setSearchId(result.id);
      buscarPago(result.id);
      setActiveTab('consultar');
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    const result = await buscarPago(searchId);
    if (result) {
      setFormDataEdit({
        ...result,
        fechaPago: result.fechaPago ? result.fechaPago.split('T')[0] : ''
      });
    }
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    if (!formDataEdit) return;

    const result = await actualizarPago(formDataEdit.id, formDataEdit);
    if (result) {
      setFormDataEdit({
        ...result,
        fechaPago: result.fechaPago ? result.fechaPago.split('T')[0] : ''
      });
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!formDataEdit) return;
    const updated = { ...formDataEdit, estadoPago: nuevoEstado };
    const result = await actualizarPago(formDataEdit.id, updated);
    if (result) {
      setFormDataEdit({
        ...result,
        fechaPago: result.fechaPago ? result.fechaPago.split('T')[0] : ''
      });
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FiDollarSign className="text-primary" /> Pagos y Facturación
        </h1>
        <p className="text-slate-600 mt-2">Gestiona los pagos de visitas técnicas y reparaciones</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-colors ${activeTab === 'registrar' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            onClick={() => setActiveTab('registrar')}
          >
            Registrar Nuevo Pago
          </button>
          <button
            className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-colors ${activeTab === 'consultar' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            onClick={() => setActiveTab('consultar')}
          >
            Consultar / Modificar Pago
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'registrar' && (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleCrear} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID Visita Técnica</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formDataNuevo.idVisitaTecnica}
                      onChange={(e) => setFormDataNuevo({...formDataNuevo, idVisitaTecnica: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto (CLP)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2 pl-8 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={formDataNuevo.monto}
                        onChange={(e) => setFormDataNuevo({...formDataNuevo, monto: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCreditCard className="text-slate-400" />
                      </div>
                      <select
                        className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={formDataNuevo.metodoPago}
                        onChange={(e) => setFormDataNuevo({...formDataNuevo, metodoPago: e.target.value})}
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                        <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Pago</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formDataNuevo.fechaPago}
                      onChange={(e) => setFormDataNuevo({...formDataNuevo, fechaPago: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
                  <textarea
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                    value={formDataNuevo.descripcion}
                    onChange={(e) => setFormDataNuevo({...formDataNuevo, descripcion: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <FiSave /> {loading ? 'Procesando...' : 'Registrar Pago'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'consultar' && (
            <div>
              <form onSubmit={handleBuscar} className="mb-8 max-w-xl mx-auto flex gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-slate-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="Ingresa el ID del Pago"
                    required
                    className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Buscar
                </button>
              </form>

              {formDataEdit && (
                <div className={`max-w-2xl mx-auto rounded-2xl border p-6 md:p-8 ${formDataEdit.estadoPago === 'ANULADO' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-200">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Pago #{formDataEdit.id}</h3>
                      <p className="text-slate-500">Visita Técnica #{formDataEdit.idVisitaTecnica}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-extrabold text-slate-900 mb-2">
                        {formatPrice(formDataEdit.monto)}
                      </div>
                      <StatusBadge status={formDataEdit.estadoPago} />
                    </div>
                  </div>

                  {formDataEdit.estadoPago === 'ANULADO' && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                      <FiXCircle className="text-xl flex-shrink-0" />
                      <p className="text-sm font-medium">Este pago fue anulado y no puede modificarse.</p>
                    </div>
                  )}

                  <form onSubmit={handleActualizar} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                        <select
                          disabled={formDataEdit.estadoPago === 'ANULADO'}
                          className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100"
                          value={formDataEdit.metodoPago}
                          onChange={(e) => setFormDataEdit({...formDataEdit, metodoPago: e.target.value})}
                        >
                          <option value="EFECTIVO">Efectivo</option>
                          <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                          <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                          <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Pago</label>
                        <input
                          type="date"
                          disabled={formDataEdit.estadoPago === 'ANULADO'}
                          className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100"
                          value={formDataEdit.fechaPago}
                          onChange={(e) => setFormDataEdit({...formDataEdit, fechaPago: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                      <textarea
                        disabled={formDataEdit.estadoPago === 'ANULADO'}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100"
                        rows="3"
                        value={formDataEdit.descripcion || ''}
                        onChange={(e) => setFormDataEdit({...formDataEdit, descripcion: e.target.value})}
                      ></textarea>
                    </div>

                    {formDataEdit.estadoPago !== 'ANULADO' && (
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2"
                        >
                          <FiSave /> Guardar cambios
                        </button>

                        {formDataEdit.estadoPago === 'PENDIENTE' && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleCambiarEstado('PAGADO')}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2"
                          >
                            <FiCheckCircle /> Marcar como PAGADO
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            if(window.confirm("¿Seguro que deseas anular este pago? Esta acción no se puede deshacer.")) {
                              handleCambiarEstado('ANULADO');
                            }
                          }}
                          className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 ml-auto"
                        >
                          <FiXCircle /> Anular Pago
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagos;
