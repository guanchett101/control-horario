import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function RegistroHorario({ user, onLogout }) {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());
  const [registrosHoy, setRegistrosHoy] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    const interval = setInterval(() => setHoraActual(new Date()), 1000);
    cargarRegistrosHoy();
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarRegistrosHoy = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const response = await axios.get(
        `${API_URL}/registros/empleado/${user.empleadoId}?fechaInicio=${hoy}&fechaFin=${hoy}`
      );
      setRegistrosHoy(response.data);
    } catch (error) {
      console.error('Error al cargar registros:', error);
    } finally {
      setLoadingRegistros(false);
    }
  };

  const registrarEntrada = async () => {
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/registros/entrada`, {
        empleadoId: user.empleadoId
      });
      setMensaje(`✅ Entrada registrada a las ${response.data.hora}`);
      setTimeout(() => setMensaje(''), 5000);
      cargarRegistrosHoy();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar entrada');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const registrarSalida = async () => {
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/registros/salida`, {
        empleadoId: user.empleadoId
      });
      setMensaje(`✅ Salida registrada a las ${response.data.hora}`);
      setTimeout(() => setMensaje(''), 5000);
      cargarRegistrosHoy();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar salida');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcularHoras = (entrada, salida) => {
    if (!entrada || !salida) return '-';
    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = salida.split(':').map(Number);
    const minutos = (hS * 60 + mS) - (hE * 60 + mE);
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const registroActual = registrosHoy.find(r => !r.hora_salida);
  const yaRegistroEntrada = registrosHoy.some(r => !r.hora_salida);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '0.75rem' : '1.5rem', boxSizing: 'border-box' }}>
        {/* Header con reloj */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          borderRadius: '12px',
          padding: isMobile ? '1.5rem' : '2rem',
          color: 'white',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 15px rgba(30, 60, 114, 0.2)',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700' }}>
            {user.nombre} {user.apellido}
          </h1>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.85rem' }}>
            {formatearFecha(horaActual)}
          </p>
          <div style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '800', lineHeight: 1, fontFamily: 'monospace', letterSpacing: '1px' }}>
            {formatearHora(horaActual)}
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #a7f3d0',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            {mensaje}
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #fecaca',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Botones de registro */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            Registrar Horario
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '0.75rem' : '1.5rem'
          }}>
            <button
              onClick={registrarEntrada}
              disabled={loading || yaRegistroEntrada}
              style={{
                background: yaRegistroEntrada ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: yaRegistroEntrada ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!yaRegistroEntrada && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <span style={{ fontSize: '2rem' }}>🟢</span>
              {loading ? 'Registrando...' : yaRegistroEntrada ? 'Ya registrado' : 'Registrar Entrada'}
            </button>

            <button
              onClick={registrarSalida}
              disabled={loading || !yaRegistroEntrada}
              style={{
                background: !yaRegistroEntrada ? '#9ca3af' : '#ef4444',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: !yaRegistroEntrada ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (yaRegistroEntrada && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <span style={{ fontSize: '2rem' }}>🔴</span>
              {loading ? 'Registrando...' : !yaRegistroEntrada ? 'Primero registra entrada' : 'Registrar Salida'}
            </button>
          </div>

          {registroActual && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#dbeafe',
              borderRadius: '8px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>
                ⏱️ Entrada registrada a las {registroActual.hora_entrada}
              </div>
            </div>
          )}
        </div>

        {/* Historial del día */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            📋 Registros de Hoy
          </h3>

          {loadingRegistros ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando...
            </div>
          ) : registrosHoy.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              No hay registros para hoy
            </div>
          ) : (
            <div>
              {registrosHoy.map((reg, index) => (
                <div key={reg.id} style={{
                  padding: '1rem',
                  borderBottom: index < registrosHoy.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Registro #{index + 1}
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Entrada: </span>
                        <span style={{ fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>
                          {reg.hora_entrada || '-'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Salida: </span>
                        <span style={{ fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>
                          {reg.hora_salida || '-'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Horas: </span>
                        <span style={{ fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>
                          {calcularHoras(reg.hora_entrada, reg.hora_salida)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {!reg.hora_salida ? (
                      <span style={{
                        background: '#d1fae5',
                        color: '#059669',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        En curso
                      </span>
                    ) : (
                      <span style={{
                        background: '#e5e7eb',
                        color: '#374151',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        Completado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
            💡 Instrucciones
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li>Presiona <strong>"Registrar Entrada"</strong> al llegar a trabajar</li>
            <li>Presiona <strong>"Registrar Salida"</strong> al terminar tu jornada</li>
            <li>Puedes ver tus registros del día en tiempo real</li>
            <li>Los registros quedan guardados automáticamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RegistroHorario;
