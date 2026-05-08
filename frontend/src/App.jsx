import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Agendamiento from './pages/Agendamiento';
import Catalogo from './pages/Catalogo';
import Inventario from './pages/Inventario';
import Ordenes from './pages/Ordenes';
import Pagos from './pages/Pagos';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/agendamiento" element={
            <ProtectedRoute><Agendamiento /></ProtectedRoute>
          } />
          <Route path="/ordenes" element={
            <ProtectedRoute><Ordenes /></ProtectedRoute>
          } />
          <Route path="/pagos" element={
            <ProtectedRoute roles={['ADMIN', 'TECNICO']}><Pagos /></ProtectedRoute>
          } />
          <Route path="/inventario" element={
            <ProtectedRoute roles={['ADMIN', 'TECNICO']}><Inventario /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}><Admin /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
