import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiMenu, FiX, FiTool } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Agendamiento', path: '/agendamiento' },
    { name: 'Mis Órdenes', path: '/ordenes' },
    { name: 'Inventario', path: '/inventario' },
    { name: 'Pagos', path: '/pagos' },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ name: 'Usuarios', path: '/usuarios' });
    navLinks.push({ name: 'Panel Admin', path: '/admin' });
  }

  return (
    <nav className="bg-darkBackground text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
              <FiTool className="text-3xl" />
              <span>TechFix</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
                <span className="text-sm text-slate-300">Hola, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-error hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FiLogOut /> Salir
                </button>
              </div>
            ) : (
              <div className="ml-4 pl-4 border-l border-slate-700">
                <Link
                  to="/login"
                  className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800 hover:text-accent"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-error hover:bg-slate-800"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
