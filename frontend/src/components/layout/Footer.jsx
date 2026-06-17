import { FiTool, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-darkBackground text-slate-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-accent mb-4">
              <FiTool />
              <span>TechFix</span>
            </div>
            <p className="text-sm">
              Servicio técnico especializado en computadores y celulares. Reparación rápida, garantizada y al mejor precio en Santiago.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-accent transition-colors">Inicio</a></li>
              <li><a href="/catalogo" className="hover:text-accent transition-colors">Catálogo de Repuestos</a></li>
              <li><a href="/agendamiento" className="hover:text-accent transition-colors">Agendar Visita</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><FiMapPin /> Providencia 1234, Santiago, Chile</li>
              <li className="flex items-center gap-2"><FiPhone /> +56 9 1234 5678</li>
              <li className="flex items-center gap-2"><FiMail /> contacto@techfix.cl</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} TechFix. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
