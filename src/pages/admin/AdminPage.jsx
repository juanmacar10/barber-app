import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button/Button';
import { formatTo12Hour } from '../../utils/formatTime';
import './AdminPage.scss';
import { StatsChart } from '../../components/stats/StatsChart';

export const AdminPage = () => {
  const [reservas, setReservas] = useState([]);
  const [activeTab, setActiveTab] = useState('citas');
  const [filter, setFilter] = useState('pendiente');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
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

  const monthStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const finalizedInMonth = reservas.filter(r =>
      r.estado === 'finalizada' && r.fecha >= startStr && r.fecha <= endStr
    );
    const count = finalizedInMonth.length;
    const gananciaBarbero = count * 12000;
    return { count, gananciaBarbero };
  }, [selectedMonth, reservas]);

  const sendWhatsApp = (reserva, nuevoEstado) => {
    const { telefono, nombre, servicio, fecha, hora, precio } = reserva;
    const horaFormateada = formatTo12Hour(hora);
    const numeroLimpio = telefono.replace(/\D/g, '');
    const numeroConCodigo = numeroLimpio.startsWith('57') ? numeroLimpio : `57${numeroLimpio}`;

    let mensaje = '';
    if (nuevoEstado === 'finalizada') {
      // No se usa porque no llamamos a esta función para finalizada
      return;
    } else if (nuevoEstado === 'incumplida') {
      mensaje = `Hola ${nombre}, lamentamos informarte que tu reserva del día ${fecha} a las ${horaFormateada} ha sido cancelada por INCUMPLIMIENTO (no asististe). Si deseas reagendar, contáctanos.`;
    } else if (nuevoEstado === 'confirmada') {
      mensaje = `Hola ${nombre}, tu reserva para ${servicio} el día ${fecha} a las ${horaFormateada} ha sido CONFIRMADA. Valor total: $${precio?.toLocaleString('es-CO')} COP. ¡Te esperamos!`;
    } else if (nuevoEstado === 'rechazada') {
      mensaje = `Hola ${nombre}, tu reserva para ${servicio} el día ${fecha} a las ${horaFormateada} ha sido RECHAZADA. Por favor contacta con nosotros.`;
    }

    const url = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleStatusChange = async (id, nuevoEstado, reservaData) => {
    try {
      await updateDoc(doc(db, 'reservas', id), { estado: nuevoEstado });

      let msg = '';
      let notifType = 'success';

      if (nuevoEstado === 'finalizada') {
        msg = `✅ Reserva de ${reservaData.nombre} marcada como FINALIZADA.`;
        notifType = 'success';
      } else if (nuevoEstado === 'incumplida') {
        msg = `⚠️ Reserva de ${reservaData.nombre} marcada como INCUMPLIDA. Se envió WhatsApp al cliente.`;
        notifType = 'warning';
        sendWhatsApp(reservaData, nuevoEstado);
      } else if (nuevoEstado === 'confirmada') {
        msg = `📌 Reserva de ${reservaData.nombre} confirmada. Se envió WhatsApp.`;
        notifType = 'info';
        sendWhatsApp(reservaData, nuevoEstado);
      } else if (nuevoEstado === 'rechazada') {
        msg = `❌ Reserva de ${reservaData.nombre} rechazada. Se envió WhatsApp.`;
        notifType = 'error';
        sendWhatsApp(reservaData, nuevoEstado);
      }

      setNotification({ message: msg, type: notifType });
      setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setNotification({ message: 'Error al actualizar la reserva', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const reservasFiltradas = filter === 'todas'
    ? reservas
    : reservas.filter(r => r.estado === filter);

  const cortesARealizar = reservas.filter(r => r.estado === 'confirmada');

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'pendiente': return 'pendiente';
      case 'confirmada': return 'confirmada';
      case 'rechazada': return 'rechazada';
      case 'finalizada': return 'finalizada';
      case 'incumplida': return 'incumplida';
      default: return '';
    }
  };

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <h1>Panel de administración</h1>
        <Button onClick={handleLogout} variant="danger">Cerrar sesión</Button>
      </div>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`}
          onClick={() => setActiveTab('citas')}
        >
          📋 Citas
        </button>
        <button
          className={`tab-btn ${activeTab === 'cortes' ? 'active' : ''}`}
          onClick={() => setActiveTab('cortes')}
        >
          ✂️ Cortes a realizar
        </button>
        <button
          className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setActiveTab('estadisticas')}
        >
          📊 Estadísticas
        </button>
      </div>

      {activeTab === 'citas' && (
        <>
          <div className="filter-bar">
            <label>Filtrar por estado: </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="incumplida">Incumplidas</option>
              <option value="rechazada">Rechazadas</option>
              <option value="todas">Todas</option>
            </select>
          </div>
          <div className="reservas-grid">
            {reservasFiltradas.length === 0 ? (
              <p>No hay reservas con el filtro seleccionado.</p>
            ) : (
              reservasFiltradas.map(reserva => (
                <div key={reserva.id} className="reserva-card">
                  <p><strong>Cliente:</strong> {reserva.nombre}</p>
                  <p><strong>Teléfono:</strong> {reserva.telefono}</p>
                  <p><strong>Servicio:</strong> {reserva.servicio}</p>
                  <p><strong>Fecha:</strong> {reserva.fecha} - {formatTo12Hour(reserva.hora)}</p>
                  <p><strong>Precio:</strong> ${reserva.precio?.toLocaleString('es-CO')} COP</p>
                  <p>
                    <strong>Estado:</strong>{' '}
                    <span className={`estado-badge ${getBadgeClass(reserva.estado)}`}>
                      {reserva.estado === 'finalizada' ? 'Finalizada' : reserva.estado === 'incumplida' ? 'Incumplida' : reserva.estado}
                    </span>
                  </p>
                  <div className="acciones">
                    {reserva.estado === 'pendiente' && (
                      <>
                        <Button onClick={() => handleStatusChange(reserva.id, 'confirmada', reserva)}>Confirmar</Button>
                        <Button onClick={() => handleStatusChange(reserva.id, 'rechazada', reserva)} variant="danger">Rechazar</Button>
                      </>
                    )}
                    {reserva.estado === 'confirmada' && (
                      <Button onClick={() => handleStatusChange(reserva.id, 'finalizada', reserva)}>Finalizar</Button>
                    )}
                    {(reserva.estado === 'finalizada' || reserva.estado === 'incumplida' || reserva.estado === 'rechazada') && (
                      <span className="no-action">✅ Acción ya registrada</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'cortes' && (
        <div className="reservas-grid">
          {cortesARealizar.length === 0 ? (
            <p>No hay cortes confirmados pendientes de realizar.</p>
          ) : (
            cortesARealizar.map(reserva => (
              <div key={reserva.id} className="reserva-card">
                <p><strong>Cliente:</strong> {reserva.nombre}</p>
                <p><strong>Teléfono:</strong> {reserva.telefono}</p>
                <p><strong>Servicio:</strong> {reserva.servicio}</p>
                <p><strong>Fecha:</strong> {reserva.fecha} - {formatTo12Hour(reserva.hora)}</p>
                <p><strong>Precio:</strong> ${reserva.precio?.toLocaleString('es-CO')} COP</p>
                <div className="acciones">
                  <Button onClick={() => handleStatusChange(reserva.id, 'finalizada', reserva)}> 
                    Finalizado (asistió)
                  </Button>
                  <Button onClick={() => handleStatusChange(reserva.id, 'incumplida', reserva)} variant="danger">
                    Incumplimiento (no asistió)
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'estadisticas' && (
        <div className="stats-section">
          <h2>Estadísticas mensuales</h2>
          <div className="month-selector">
            <label>Seleccionar mes: </label>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Cortes finalizados</h3>
              <p className="stat-number">{monthStats.count}</p>
            </div>
            <div className="stat-card">
              <h3>Ganancias</h3>
              <p className="stat-number">${monthStats.gananciaBarbero.toLocaleString('es-CO')} COP</p>
            </div>
          </div>
          <StatsChart selectedMonth={selectedMonth} reservas={reservas} />
        </div>
      )}
    </div>
  );
};