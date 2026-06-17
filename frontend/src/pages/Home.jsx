import { Link } from 'react-router-dom';
import { FiMonitor, FiSmartphone, FiCpu, FiActivity, FiCalendar, FiCreditCard, FiShield, FiClock, FiTool } from 'react-icons/fi';

const Home = () => {
  return (
    <div>
      <section className="bg-gradient-to-br from-darkBackground to-slate-800 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Servicio técnico especializado en <span className="text-accent">PCs y celulares</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
            Soluciones rápidas, transparentes y garantizadas en Santiago, Chile.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/agendamiento" className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <FiCalendar /> Agendar Visita
            </Link>
            <Link to="/catalogo" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold py-3 px-8 rounded-full text-lg transition-all flex items-center justify-center gap-2">
              <FiTool /> Ver Repuestos
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Nuestros Servicios</h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard icon={<FiMonitor />} title="Reparación de Computadores" desc="Formateo, limpieza interna, solución a pantallazos azules y recuperación de datos." />
            <ServiceCard icon={<FiSmartphone />} title="Reparación de Celulares" desc="Cambio de pantallas, baterías, conectores de carga y reparación de placas." />
            <ServiceCard icon={<FiCpu />} title="Upgrades de Hardware" desc="Instalación de SSD, aumento de RAM y actualización de procesadores o tarjetas de video." />
            <ServiceCard icon={<FiActivity />} title="Diagnóstico Técnico" desc="Evaluación exhaustiva para detectar cualquier falla de hardware o software." />
            <ServiceCard icon={<FiCalendar />} title="Agendamiento de Visita" desc="Atención a domicilio o en nuestro taller según tu conveniencia." />
            <ServiceCard icon={<FiCreditCard />} title="Facturación en CLP" desc="Múltiples métodos de pago con precios transparentes en pesos chilenos." />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">¿Por qué TechFix?</h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 text-primary rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
                <FiClock />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rapidez Garantizada</h3>
              <p className="text-slate-600">Entregamos el 80% de los equipos en menos de 48 horas sin comprometer la calidad del servicio.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
                <FiShield />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Garantía Extendida</h3>
              <p className="text-slate-600">Todas nuestras reparaciones cuentan con 3 meses de garantía. Tu tranquilidad es nuestra prioridad.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-orange-100 text-accent rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
                <FiTool />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Técnicos Expertos</h3>
              <p className="text-slate-600">Personal altamente capacitado y certificado en las principales marcas del mercado tecnológico.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">¿Tu equipo necesita ayuda urgente?</h2>
          <Link to="/agendamiento" className="inline-block bg-white text-primary hover:bg-slate-100 font-bold py-4 px-10 rounded-full text-lg shadow-xl transition-transform transform hover:scale-105">
            Agendar Visita Ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

const ServiceCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-slate-100 group">
    <div className="text-4xl text-primary mb-6 group-hover:scale-110 transition-transform origin-left">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default Home;
