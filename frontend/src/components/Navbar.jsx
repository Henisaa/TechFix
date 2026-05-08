import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiCalendar, FiPackage, FiDollarSign, FiActivity,
  FiLogOut, FiUser, FiMenu, FiX, FiShield,
} from 'react-icons/fi';

const NAV_LINKS = [
  { to: '/',             label: 'Inicio',       icon: <FiHome />,       roles: ['ALL'] },
  { to: '/catalogo',     label: 'Catálogo',     icon: <FiPackage />,    roles: ['ALL'] },
  { to: '/agendamiento', label: 'Agendar',      icon: <FiCalendar />,   roles: ['ALL'] },
  { to: '/ordenes',      label: 'Órdenes',      icon: <FiActivity />,   roles: ['ALL'] },
  { to: '/pagos',        label: 'Pagos',        icon: <FiDollarSign />, roles: ['ADMIN', 'TECNICO'] },
  { to: '/inventario',   label: 'Inventario',   icon: <FiPackage />,    roles: ['ADMIN', 'TECNICO'] },
  { to: '/admin',        label: 'Panel Admin',  icon: <FiShield />,     roles: ['ADMIN'] },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleLinks = NAV_LINKS.filter(
    (l) => l.roles.includes('ALL') || (user && l.roles.includes(user.role))
  );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-primary">
            🔧 <span>TechFix</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiUser className="text-primary" />
                  <span className="font-medium">{user.fullName || user.username}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <FiLogOut /> Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Iniciar Sesión
              </Link>
            )}
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setOpen(!open)}>
            {open ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white py-3 px-4 space-y-1">
          {visibleLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === l.to ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {l.icon} {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => { handleLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-red-500 text-sm font-medium"
            >
              <FiLogOut /> Cerrar sesión
            </button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-primary font-medium text-sm">
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
