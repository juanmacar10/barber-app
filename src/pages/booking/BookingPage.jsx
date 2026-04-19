import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Input } from '../../components/input/Input';
import { Button } from '../../components/button/Button';

export const BookingPage = () => {
  const PRECIO_BASE = 10000; // 10k COP
  const PRECIO_ADICIONAL = 2000;   // 2k por la reserva
  const total = PRECIO_BASE + PRECIO_ADICIONAL;

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    servicio: 'corte',   // solo corte por ahora
    fecha: '',
    hora: '',
    vip: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

    try {
      const reserva = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        servicio: formData.servicio,
        fecha: formData.fecha,
        hora: formData.hora,
        vip: formData.vip,
        precio: total,
        estado: 'pendiente',
        createdAt: new Date()
      };
      await addDoc(collection(db, 'reservas'), reserva);
      setSuccess('Reserva creada exitosamente');
      setFormData({
        nombre: '',
        telefono: '',
        servicio: 'corte',
        fecha: '',
        hora: '',
        vip: false
      });
    } catch (err) {
      console.error(err);
      setError('Error al guardar la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', maxWidth: '600px' }}>
      <h1>Reservar cita</h1>
      <form onSubmit={handleSubmit}>
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
            <option value="corte">Corte de cabello - $10,000</option>
          </select>
        </div>

        <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#f0f0f0', borderRadius: '8px' }}>
          <p><strong>Precio del corte:</strong> $10,000 COP</p>
          <p><strong>Cargo por reserva / VIP:</strong> +$2,000 COP</p>
          <p><strong>Total a pagar:</strong> ${total.toLocaleString('es-CO')} COP</p>
          <small style={{ color: '#666' }}>Este cargo no es opcional.</small>
        </div>

        <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#f0f0f0', borderRadius: '8px' }}>
          <strong>Total a pagar: ${total.toLocaleString('es-CO')} COP</strong>
        </div>

        <Input
          label="Fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleChange}
          placeholder="2025-10-20"
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

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '1rem' }}>{success}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Reservar'}
        </Button>
      </form>
    </div>
  );
};