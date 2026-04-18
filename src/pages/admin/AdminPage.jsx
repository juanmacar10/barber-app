import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';

export const AdminPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <h1>Panel de administración</h1>
      <p>Bienvenido al panel. Aquí verás las reservas.</p>
      <button onClick={handleLogout} style={{ padding: '0.75rem 1.5rem', background: '#1A1A1A', color: '#F5F0E8', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  );
};