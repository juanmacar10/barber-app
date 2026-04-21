import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { formatTo12Hour } from '../../utils/formatTime'; // 👈 importar
import './HomePage.scss';

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [busyHours, setBusyHours] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'reservas'),
          where('fecha', '==', selectedDate),
          where('estado', 'in', ['pendiente', 'confirmada'])
        );
        const querySnapshot = await getDocs(q);
        const hours = querySnapshot.docs.map(doc => doc.data().hora);
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

  // Separar horas AM y PM
  const morningHours = busyHours.filter(hour => hour < "12:00");
  const afternoonHours = busyHours.filter(hour => hour >= "12:00");

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
          <div className="hours-split">
            <div className="hours-column">
              <h4>🌅 Mañana</h4>
              <div className="busy-hours">
                {morningHours.length === 0 ? (
                  <span className="no-hours">✅ Sin reservas</span>
                ) : (
                  morningHours.map(hour => (
                    <span key={hour} className="hour-badge">
                      🕒 {formatTo12Hour(hour)}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="hours-column">
              <h4>🌙 Tarde</h4>
              <div className="busy-hours">
                {afternoonHours.length === 0 ? (
                  <span className="no-hours">✅ Sin reservas</span>
                ) : (
                  afternoonHours.map(hour => (
                    <span key={hour} className="hour-badge">
                      🕒 {formatTo12Hour(hour)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        <div className="message emergency">
          ⏱️ <strong>Información importante:</strong> Los cortes tienen una duración aproximada de <strong>50min a 1h</strong>. Por favor, considera este tiempo al reservar.
        </div>
        
      </div>
      <button className="reserve-now-btn" onClick={() => navigate('/reservar')}>
        ✂️ Reservar ahora ✂️
      </button>
    </div>
  );
};