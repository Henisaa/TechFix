import { FiUsers, FiUserCheck, FiTool, FiDollarSign, FiActivity, FiPackage } from 'react-icons/fi';

const Admin = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-600 mt-2">Resumen y métricas del sistema TechFix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FiUsers />} 
          title="Total Usuarios" 
          value="12" 
          desc="Usuarios registrados en el sistema"
          color="bg-blue-500"
        />
        <StatCard 
          icon={<FiUserCheck />} 
          title="Usuarios Activos" 
          value="10" 
          desc="Cuentas habilitadas"
          color="bg-green-500"
        />
        <StatCard 
          icon={<FiTool />} 
          title="Técnicos" 
          value="3" 
          desc="Personal técnico registrado"
          color="bg-orange-500"
        />
        <StatCard 
          icon={<FiDollarSign />} 
          title="Pagos Registrados" 
          value="45" 
          desc="Operaciones de pago históricas"
          color="bg-purple-500"
        />
        <StatCard 
          icon={<FiActivity />} 
          title="Órdenes Activas" 
          value="15" 
          desc="Reparaciones en curso (Servicio Pendiente)"
          color="bg-slate-400"
          pending={true}
        />
        <StatCard 
          icon={<FiPackage />} 
          title="Repuestos en Stock" 
          value="124" 
          desc="Ítems disponibles (Servicio Pendiente)"
          color="bg-slate-400"
          pending={true}
        />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6 mt-12">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/usuarios" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary transition-all group flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-blue-50 text-primary rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            <FiUsers />
          </div>
          <h3 className="font-bold text-slate-800">Gestión de Usuarios</h3>
        </a>
        <a href="/pagos" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary transition-all group flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            <FiDollarSign />
          </div>
          <h3 className="font-bold text-slate-800">Pagos y Facturación</h3>
        </a>
        <a href="/inventario" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary transition-all group flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            <FiPackage />
          </div>
          <h3 className="font-bold text-slate-800">Inventario</h3>
        </a>
        <a href="/ordenes" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary transition-all group flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            <FiActivity />
          </div>
          <h3 className="font-bold text-slate-800">Órdenes</h3>
        </a>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, desc, color, pending }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
    <div className={`mt-1 flex-shrink-0 h-12 w-12 rounded-xl text-white flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {pending && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Pendiente</span>}
      </div>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  </div>
);

export default Admin;
