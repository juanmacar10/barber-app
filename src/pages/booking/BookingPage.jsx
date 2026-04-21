import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Input } from '../../components/input/Input';
import { Button } from '../../components/button/Button';
import './BookingPage.scss';

export const BookingPage = () => {
  const PRECIO_BASE = 10000;
  const PRECIO_ADICIONAL = 2000;
  const total = PRECIO_BASE + PRECIO_ADICIONAL;

  // Calcular fechas mínima (hoy) y máxima (mañana)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const minDate = today.toISOString().split('T')[0];
  const maxDate = tomorrow.toISOString().split('T')[0];

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    // Validar que la fecha esté entre hoy y mañana
    if (formData.fecha < minDate || formData.fecha > maxDate) {
      setError(`Solo puedes reservar para hoy (${minDate}) o mañana (${maxDate})`);
      setLoading(false);
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
      setFormData({
        nombre: '',
        telefono: '',
        servicio: 'corte',
        fecha: '',
        hora: ''
      });
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
        ℹ️ Solo puedes reservar para <strong>hoy o mañana</strong>. Por favor, elige una fecha dentro de ese rango.
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
          min={minDate}   // fecha mínima: hoy
          max={maxDate}   // fecha máxima: mañana
          placeholder="2025-10-25"
          required
        />
        <Input
          label="Hora"
          name="hora"
          type="time"
          value={formData.hora}
          onChange={handleChange}
          placeholder="10:00"
          required
        />

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