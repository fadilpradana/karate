// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { session } = useAuth();

  // Jika tidak ada sesi (user belum login), arahkan ke halaman login
  if (!session) {
    return <Navigate to="/login" />;
  }

  // Jika ada sesi, tampilkan komponen anak (halaman yang diproteksi)
  return children;
}

export default ProtectedRoute;
