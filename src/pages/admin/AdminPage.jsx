import { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button/Button';
import './AdminPage.scss'; // importamos los estilos

export const AdminPage = () => {
  const [reservas, setReservas] = useState([]);
  const [filter, setFilter] = useState('todas');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reservas'), (snapshot) => {
      const reservasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReservas(reservasData);
    });
    return () => unsubscribe();
  }, []);

  const sendWhatsApp = (reserva, nuevoEstado) => {
    const { telefono, nombre, servicio, fecha, hora, precio } = reserva;
    const numeroLimpio = telefono.replace(/\D/g, '');
    const numeroConCodigo = numeroLimpio.startsWith('57') ? numeroLimpio : `57${numeroLimpio}`;

    let mensaje = '';
    if (nuevoEstado === 'confirmada') {
      mensaje = `Hola ${nombre}, tu reserva para ${servicio} el día ${fecha} a las ${hora} ha sido CONFIRMADA. Valor total: $${precio?.toLocaleString('es-CO')} COP. ¡Te esperamos!`;
    } else if (nuevoEstado === 'rechazada') {
      mensaje = `Hola ${nombre}, lamentamos informarte que tu reserva para ${servicio} el día ${fecha} a las ${hora} ha sido RECHAZADA. Por favor contacta con nosotros para más información.`;
    }

    const url = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleStatusChange = async (id, nuevoEstado, reservaData) => {
    try {
      await updateDoc(doc(db, 'reservas', id), { estado: nuevoEstado });
      if (nuevoEstado === 'confirmada' || nuevoEstado === 'rechazada') {
        sendWhatsApp(reservaData, nuevoEstado);
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const reservasFiltradas = filter === 'todas'
    ? reservas
    : reservas.filter(r => r.estado === filter);

  // Función para obtener la clase del badge según estado
  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'pendiente': return 'pendiente';
      case 'confirmada': return 'confirmada';
      case 'rechazada': return 'rechazada';
      default: return '';
    }
  };

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <h1>Panel de administración</h1>
        <Button onClick={handleLogout} variant="secondary">Cerrar sesión</Button>
      </div>

      <div className="filter-bar">
        <label>Filtrar por estado: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
      </div>

      <div className="reservas-grid">
        {reservasFiltradas.map(reserva => (
          <div key={reserva.id} className="reserva-card">
            <p><strong>Cliente:</strong> {reserva.nombre}</p>
            <p><strong>Teléfono:</strong> {reserva.telefono}</p>
            <p><strong>Servicio:</strong> {reserva.servicio}</p>
            <p><strong>Fecha:</strong> {reserva.fecha} - {reserva.hora}</p>
            <p><strong>Precio:</strong> ${reserva.precio?.toLocaleString('es-CO')} COP</p>
            <p>
              <strong>Estado:</strong>{' '}
              <span className={`estado-badge ${getBadgeClass(reserva.estado)}`}>
                {reserva.estado}
              </span>
            </p>
            <div className="acciones">
              {reserva.estado === 'pendiente' && (
                <>
                  <Button onClick={() => handleStatusChange(reserva.id, 'confirmada', reserva)}>
                    Confirmar
                  </Button>
                  <Button onClick={() => handleStatusChange(reserva.id, 'rechazada', reserva)} variant="secondary">
                    Rechazar
                  </Button>
                </>
              )}
              {reserva.estado === 'confirmada' && <span>✅ Confirmada</span>}
              {reserva.estado === 'rechazada' && <span>❌ Rechazada</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};