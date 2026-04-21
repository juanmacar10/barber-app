import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './HomePage.scss';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  //hook de navegación
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Fecha actual en formato YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [busyHours, setBusyHours] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        // Consultar reservas para la fecha seleccionada (solo pendientes y confirmadas)
        const q = query(
          collection(db, 'reservas'),
          where('fecha', '==', selectedDate),
          where('estado', 'in', ['pendiente', 'confirmada'])
        );
        const querySnapshot = await getDocs(q);
        const hours = querySnapshot.docs.map(doc => doc.data().hora);
        // Eliminar duplicados y ordenar
        const uniqueHours = [...new Set(hours)].sort();
        setBusyHours(uniqueHours);
      } catch (error) {
        console.error('Error al obtener reservas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [selectedDate]);

  return (
    <div className="container home-page">
      <div className="welcome-section">
        <h1>Bienvenido a Barber Revolution</h1>
        <p>Reserva tu cita de manera fácil y rápida</p>
      </div>

      <div className="info-section">
        <div className="date-picker">
          <label>📅 Consultar disponibilidad para:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <h3>Horas ocupadas para esta fecha:</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="busy-hours">
            {busyHours.length === 0 ? (
              <span className="no-hours">✅ No hay reservas aún para esta fecha</span>
            ) : (
              busyHours.map(hour => (
                <span key={hour} className="hour-badge">
                  🕒 {hour}
                </span>
              ))
            )}
          </div>
        )}
        <div className="message emergency">
          ⏱️ <strong>Información importante:</strong> Los cortes tienen una duración aproximada de <strong>40 a 50 minutos</strong>. Por favor, considera este tiempo al reservar.
        </div>
        <div className="message">
          ℹ️ <strong>Nota informativa:</strong> Las horas mostradas ya están reservadas. Por favor, elige una hora diferente en el formulario de reserva.
        </div>
      </div>
      <button className="reserve-now-btn" onClick={() => navigate('/reservar')}>
        ✂️ Reservar ahora ✂️
      </button>
    </div>
  );
};