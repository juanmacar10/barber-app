// src/pages/admin/AdminPage.jsx
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button/Button';
import './AdminPage.scss';

export const AdminPage = () => {
  const [reservas, setReservas] = useState([]);
  const [filter, setFilter] = useState('todas');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeTab, setActiveTab] = useState('citas'); // 'citas' o 'estadisticas'
  const navigate = useNavigate();

  // Escuchar reservas en tiempo real
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

  // Calcular estadísticas mensuales con useMemo
  const monthStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const confirmedInMonth = reservas.filter(r => 
      r.estado === 'confirmada' && r.fecha >= startStr && r.fecha <= endStr
    );
    const count = confirmedInMonth.length;
    const socioCommission = count * 1000;      // 1k por corte para el socio
    const barberEarnings = count * 11000;      // 11k por corte para el barbero (resto)
    return { count, socioCommission, barberEarnings };
  }, [selectedMonth, reservas]);

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

  const reservasFiltradas = filter === 'pendiente' 
    ? reservas.filter(r => r.estado === 'pendiente')
    : reservas.filter(r => r.estado === filter);

  const getBadgeClass = (estado) => {
    switch(estado) {
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

      {/* Pestañas */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`}
          onClick={() => setActiveTab('citas')}
        >
          📋 Citas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setActiveTab('estadisticas')}
        >
          📊 Estadísticas
        </button>
      </div>

      {/* Contenido de la pestaña Citas */}
      {activeTab === 'citas' && (
        <>
          <div className="filter-bar">
            <label>Filtrar por estado: </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {/* <option value="todas">Todas</option> */}
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
        </>
      )}

      {/* Contenido de la pestaña Estadísticas */}
      {activeTab === 'estadisticas' && (
        <div className="stats-section">
          <h2>Estadísticas mensuales</h2>
          <div className="month-selector">
            <label>Seleccionar mes: </label>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Cortes confirmados</h3>
              <p className="stat-number">{monthStats.count}</p>
            </div>
            <div className="stat-card">
              <h3>Comisión del socio (1k x corte)</h3>
              <p className="stat-number">${monthStats.socioCommission.toLocaleString('es-CO')} COP</p>
            </div>
            <div className="stat-card">
              <h3>Ganancias del barbero (11k x corte)</h3>
              <p className="stat-number">${monthStats.barberEarnings.toLocaleString('es-CO')} COP</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};