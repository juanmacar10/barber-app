import { useState, useEffect } from 'react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Input } from '../../components/input/Input';
import { Button } from '../../components/button/Button';
import { formatTo12Hour } from '../../utils/formatTime';
import './BookingPage.scss';

export const BookingPage = () => {
  const PRECIO_BASE = 10000;
  const PRECIO_ADICIONAL = 2000;
  const total = PRECIO_BASE + PRECIO_ADICIONAL;

  // Función para obtener fecha local en formato YYYY-MM-DD
  const getLocalDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fechas mínima (hoy) y máxima (mañana) en local
  const todayDate = new Date();
  const todayStr = getLocalDateStr(todayDate);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrowDate);
  const minDate = todayStr;
  const maxDate = tomorrowStr;

  // Función para saber si una fecha es hoy (comparación local)
  const isToday = (dateStr) => dateStr === todayStr;

  // Calcular hora mínima para hoy (actual + 30 minutos)
  const getMinTimeForToday = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    servicio: 'corte',
    fecha: '',
    hora: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [busyHours, setBusyHours] = useState([]);
  const [fetchingHours, setFetchingHours] = useState(false);

  // Consultar horas ocupadas cuando cambia la fecha
  useEffect(() => {
    const fetchBusyHours = async () => {
      if (!formData.fecha) return;
      setFetchingHours(true);
      try {
        const q = query(
          collection(db, 'reservas'),
          where('fecha', '==', formData.fecha),
          where('estado', 'in', ['pendiente', 'confirmada'])
        );
        const snapshot = await getDocs(q);
        const hours = snapshot.docs.map(doc => doc.data().hora);
        const uniqueHours = [...new Set(hours)].sort();
        setBusyHours(uniqueHours);
      } catch (err) {
        console.error('Error al consultar horas ocupadas:', err);
      } finally {
        setFetchingHours(false);
      }
    };
    fetchBusyHours();
  }, [formData.fecha]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calcular hora mínima dinámica para el input time (solo para hoy)
  const getMinTime = () => {
    if (!formData.fecha) return undefined;
    if (isToday(formData.fecha)) {
      return getMinTimeForToday();
    }
    return undefined; // Para mañana, sin restricción
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.fecha || !formData.hora) {
      setError('Debes seleccionar fecha y hora');
      setLoading(false);
      return;
    }

    // Validar que la fecha sea hoy o mañana
    if (formData.fecha < minDate || formData.fecha > maxDate) {
      setError(`Solo puedes reservar para hoy (${minDate}) o mañana (${maxDate})`);
      setLoading(false);
      return;
    }

    // Validar hora solo si la fecha es hoy
    if (isToday(formData.fecha)) {
      const minTime = getMinTimeForToday();
      if (formData.hora < minTime) {
        const minTimeFormatted = formatTo12Hour(minTime);
        setError(`Para hoy, solo puedes reservar a partir de las ${minTimeFormatted} (margen de 30 minutos).`);
        setLoading(false);
        return;
      }
    }

    // Validar que la hora no esté ocupada
    if (busyHours.includes(formData.hora)) {
      setError(`La hora ${formatTo12Hour(formData.hora)} ya está ocupada. Por favor elige otra.`);
      setLoading(false);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const reserva = {
        ...formData,
        precio: total,
        estado: 'pendiente',
        createdAt: new Date()
      };
      await addDoc(collection(db, 'reservas'), reserva);
      setSuccess('✅ Reserva creada exitosamente, recibirás un mensaje de confirmación por WhatsApp');
      setTimeout(() => setSuccess(''), 3000);
      setFormData({
        nombre: '',
        telefono: '',
        servicio: 'corte',
        fecha: '',
        hora: ''
      });
      setBusyHours([]);
    } catch (err) {
      console.error(err);
      setError('❌ Error al guardar la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container booking-page">
      <h1>Reservar cita</h1>

      <div className="info-message">
        ℹ️ Solo puedes reservar para <strong>hoy o mañana</strong>. Para hoy, la hora debe ser al menos 30 minutos después de la hora actual.
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <Input
          label="Nombre completo"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Juan Pérez"
          required
        />
        <Input
          label="Teléfono"
          name="telefono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="123456789"
          required
        />

        <div className="input-group">
          <label className="input-group__label">Servicio</label>
          <select
            name="servicio"
            value={formData.servicio}
            onChange={handleChange}
            className="input-group__field"
            required
          >
            <option value="corte">Corte de cabello</option>
          </select>
        </div>

        <div className="price-info">
          <p><strong>Precio del corte:</strong> $10,000 COP</p>
          <p><strong>Cargo por reserva / VIP:</strong> +$2,000 COP</p>
          <p><strong>Total a pagar:</strong> ${total.toLocaleString('es-CO')} COP</p>
          <small>Este cargo no es opcional. Incluye beneficios especiales.</small>
        </div>

        <Input
          label="Fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleChange}
          placeholder="YYYY-MM-DD"
          min={minDate}
          max={maxDate}
          required
        />

        <div className="input-group">
          <label className="input-group__label">Hora</label>
          <input
            type="time"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            min={getMinTime()}
            className="input-group__field"
            required
          />
          {fetchingHours && <small>Consultando horas ocupadas...</small>}
          {busyHours.length > 0 && (
            <div className="busy-hours-info">
              <p><strong>Horas no disponibles para esta fecha:</strong></p>
              <div className="busy-hours-list">
                {busyHours.map(hour => (
                  <span key={hour} className="busy-hour-badge">
                    🕒 {formatTo12Hour(hour)}
                  </span>
                ))}
              </div>
              <small>Por favor, elige una hora diferente.</small>
            </div>
          )}
        </div>

        <div className="messages">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Reservar'}
        </Button>
      </form>
    </div>
  );
};