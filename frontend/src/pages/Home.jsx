import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiPackage, FiDollarSign, FiActivity, FiArrowRight } from 'react-icons/fi';

const FEATURES = [
  { icon: '🔧', title: 'Reparaciones Certificadas', desc: 'Técnicos especializados en todo tipo de equipos.' },
  { icon: '📦', title: 'Repuestos Originales', desc: 'Stock de piezas originales con garantía incluida.' },
  { icon: '📅', title: 'Agenda en Línea', desc: 'Solicita visitas técnicas desde cualquier dispositivo.' },
  { icon: '💳', title: 'Pagos Seguros', desc: 'Múltiples métodos de pago con protección anti-duplicado.' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
            Bienvenido a <span className="text-blue-400">TechFix</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            Plataforma integral de gestión técnica. Repuestos, agendamiento, órdenes y pagos en un solo lugar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <>
                <Link to="/catalogo" className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg">
                  Ver Catálogo <FiArrowRight />
                </Link>
                <Link to="/agendamiento" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors backdrop-blur-sm border border-white/20">
                  <FiCalendar /> Agendar Visita
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg">
                  Iniciar Sesión <FiArrowRight />
                </Link>
                <Link to="/catalogo" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors backdrop-blur-sm border border-white/20">
                  Ver Catálogo
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">¿Qué ofrecemos?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">¿Listo para empezar?</h2>
          <p className="text-blue-200 mb-8">Accede al sistema para gestionar tus solicitudes de servicio técnico.</p>
          <Link
            to={user ? '/agendamiento' : '/login'}
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            {user ? <><FiCalendar /> Agendar ahora</> : <><FiArrowRight /> Comenzar</>}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
