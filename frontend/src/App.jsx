import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Agendamiento from './pages/Agendamiento';
import Ordenes from './pages/Ordenes';
import Inventario from './pages/Inventario';
import Pagos from './pages/Pagos';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/login" element={<Login />} />

            <Route path="/agendamiento" element={<ProtectedRoute><Agendamiento /></ProtectedRoute>} />
            <Route path="/ordenes" element={<ProtectedRoute><Ordenes /></ProtectedRoute>} />
            <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>} />

            <Route path="/inventario" element={<ProtectedRoute allowedRoles={['TECNICO', 'ADMIN']}><Inventario /></ProtectedRoute>} />

            <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['ADMIN']}><Usuarios /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><Admin /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
