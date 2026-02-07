import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Dashboard({ user, onLogout }) {
  const [registrosHoy, setRegistrosHoy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [horaActual, setHoraActual] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Reloj
    const interval = setInterval(() => setHoraActual(new Date()), 1000);

    // Cargar registros inmediatamente
    setLoading(true);
    cargarRegistrosHoy();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const cargarRegistrosHoy = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let url = `${API_URL}/registros?action=hoy`;

      // Si NO es admin, solo pedir sus propios registros
      if (user?.rol !== 'admin') {
        url = `${API_URL}/registros?action=empleado&id=${user.empleadoId}&fechaInicio=${new Date().toISOString().split('T')[0]}&fechaFin=${new Date().toISOString().split('T')[0]}`;
      }

      const response = await axios.get(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      setRegistrosHoy(Array.isArray(response.data) ? response.data : []);
      setError(null);
      setDebugInfo(null);
    } catch (error) {
      console.error('Error al cargar registros:', error);

      // Capturar info de debug del servidor si existe
      if (error.response?.data) {
        setDebugInfo(error.response.data);
      }

      if (error.name === 'AbortError') {
        setError('Servidor lento: La base de datos está tardando en responder. Intenta recargar de nuevo.');
      } else if (error.response?.status === 404) {
        setError('Error de configuración: No se encontró la ruta de registros en el servidor.');
      } else if (!navigator.onLine) {
        setError('Sin conexión: Revisa tu conexión a internet.');
      } else {
        setError('Error de conexión: No se pudo contactar con la base de datos de Supabase desde Vercel.');
      }
      setRegistrosHoy([]);
    } finally {
      setLoading(false);
    }
  };

  const empleadosPresentes = registrosHoy.filter(r => r.hora_entrada && !r.hora_salida).length;
  const totalRegistros = registrosHoy.length;
  const empleadosSalieron = registrosHoy.filter(r => r.hora_salida).length;

  const formatearHora = (fecha) => {
    // Formato manual simple: HH:MM:SS
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
  };

  const formatearFecha = (fecha) => {
    // Formato manual simple: Día DD de Mes de AAAA
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />

      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '1.5rem',
        boxSizing: 'border-box'
      }}>
        {/* Header con reloj */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          borderRadius: '12px',
          padding: isMobile ? '1.25rem' : '2rem',
          color: 'white',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 15px rgba(30, 60, 114, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{ margin: '0 0 0.25rem 0', fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: '700' }}>
                Hola, {user?.nombre || 'Usuario'}
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>
                {formatearFecha(horaActual)}
              </p>
            </div>
            <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
              <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: '700', lineHeight: 1, fontFamily: 'monospace', letterSpacing: '1px' }}>
                {formatearHora(horaActual)}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.rol === 'admin' ? 'Administrador' : 'Empleado'}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {error && (
          <div className="fade-in" style={{
            background: 'rgba(254, 242, 242, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            color: '#991b1b',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block' }}>{String(error)}</strong>
                {debugInfo && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                    <pre style={{ margin: 0 }}>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                )}
                <span style={{ fontSize: '0.85rem', opacity: 0.8, display: 'block', marginTop: '0.5rem' }}>
                  Si acabas de ver este error, intenta <u>deslizar hacia abajo</u> para refrescar.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                cargarRegistrosHoy();
              }}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '700',
                transition: 'transform 0.2s',
                width: isMobile ? '100%' : 'auto',
                alignSelf: isMobile ? 'stretch' : 'flex-end'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔄 Reintentar Ahora
            </button>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '0.75rem' : '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: isMobile ? '1.25rem' : '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1rem' }}>
              <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                minWidth: isMobile ? '40px' : '48px',
                borderRadius: '8px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                color: 'white'
              }}>
                ✓
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Presentes
                </div>
                <div style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: '600', color: '#111827' }}>
                  {empleadosPresentes}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: isMobile ? '1.25rem' : '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1rem' }}>
              <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                minWidth: isMobile ? '40px' : '48px',
                borderRadius: '8px',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                color: 'white'
              }}>
                ←
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Salieron
                </div>
                <div style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: '600', color: '#111827' }}>
                  {empleadosSalieron}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: isMobile ? '1.25rem' : '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1rem' }}>
              <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                minWidth: isMobile ? '40px' : '48px',
                borderRadius: '8px',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                color: 'white'
              }}>
                #
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Total Hoy
                </div>
                <div style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: '600', color: '#111827' }}>
                  {totalRegistros}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: isMobile ? '1.25rem' : '1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            margin: '0 0 1.25rem 0', 
            fontSize: isMobile ? '1rem' : '1.125rem', 
            fontWeight: '600', 
            color: '#111827' 
          }}>
            Acciones Rápidas
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: isMobile ? '0.75rem' : '1rem' 
          }}>
            <Link to="/registro" style={{
              textDecoration: 'none',
              background: '#fbbf24',
              color: '#1e3a8a',
              padding: isMobile ? '1.25rem' : '1.75rem',
              borderRadius: isMobile ? '12px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '0.75rem' : '1.25rem',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
              border: '2px solid #f59e0b'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(251, 191, 36, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(251, 191, 36, 0.3)';
              }}>
              <span style={{ fontSize: isMobile ? '2rem' : '2.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>⏱️</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  fontWeight: '800', 
                  fontSize: isMobile ? '1.1rem' : '1.5rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  lineHeight: '1.1' 
                }}>
                  {isMobile ? 'FICHAR' : 'REGISTRAR HORARIO'}
                </div>
                <div style={{ 
                  fontSize: isMobile ? '0.75rem' : '0.9rem', 
                  opacity: 0.8, 
                  fontWeight: '600', 
                  marginTop: '4px' 
                }}>
                  Entrada / Salida
                </div>
              </div>
            </Link>

            {user?.rol === 'admin' && (
              <>
                <Link to="/empleados" style={{
                  textDecoration: 'none',
                  background: '#10b981',
                  color: 'white',
                  padding: isMobile ? '1rem' : '1.25rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.75rem' : '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                  }}>
                  <span style={{ fontSize: isMobile ? '1.5rem' : '1.75rem' }}>👥</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: isMobile ? '0.9rem' : '0.95rem' }}>Empleados</div>
                    <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', opacity: 0.85 }}>Gestionar</div>
                  </div>
                </Link>

                <Link to="/reportes" style={{
                  textDecoration: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  padding: isMobile ? '1rem' : '1.25rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.75rem' : '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                  }}>
                  <span style={{ fontSize: isMobile ? '1.5rem' : '1.75rem' }}>📊</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: isMobile ? '0.9rem' : '0.95rem' }}>Reportes</div>
                    <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', opacity: 0.85 }}>Ver estadísticas</div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Registros de Hoy */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: isMobile ? '1.25rem' : '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '1rem' : '1.25rem', 
              fontWeight: '700', 
              color: '#0f172a' 
            }}>
              {user?.rol === 'admin' ? '📋 Actividad de Hoy' : '📋 Tus Registros de Hoy'}
            </h3>
            {!loading && (
              <button
                onClick={() => { setLoading(true); cargarRegistrosHoy(); }}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  padding: '0.25rem'
                }}
                title="Actualizar"
              >🔄</button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '2rem' : '4rem', color: '#64748b' }}>
              <div className="fade-in" style={{ fontSize: '2.5rem', marginBottom: '1rem', animationDirection: 'alternate', animationIterationCount: 'infinite' }}>⏳</div>
              <p style={{ fontWeight: '600', fontSize: isMobile ? '0.9rem' : '1rem' }}>Actualizando datos...</p>
            </div>
          ) : registrosHoy.length === 0 ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '2rem' : '4rem', color: '#94a3b8' }}>
              <div style={{ fontSize: isMobile ? '3rem' : '4rem', marginBottom: '1rem', opacity: 0.5 }}>🍃</div>
              <p style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: '500' }}>Todo tranquilo por ahora.</p>
              <p style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', opacity: 0.8 }}>No hay registros de actividad para hoy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.5rem' : '0.75rem' }}>
              {registrosHoy.slice(0, isMobile ? 8 : registrosHoy.length).map((registro) => (
                <div key={registro.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isMobile ? '0.75rem' : '1.25rem',
                  background: '#f8fafc',
                  borderRadius: isMobile ? '12px' : '16px',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.2s ease',
                  gap: isMobile ? '0.75rem' : '1rem',
                  flexWrap: isMobile ? 'wrap' : 'nowrap'
                }}>
                  <div style={{
                    width: isMobile ? '36px' : '48px',
                    height: isMobile ? '36px' : '48px',
                    minWidth: isMobile ? '36px' : '48px',
                    borderRadius: isMobile ? '10px' : '12px',
                    background: registro.hora_salida ? 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: isMobile ? '0.7rem' : '1rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {registro.empleados?.nombre?.charAt(0) || '?'}{registro.empleados?.apellido?.charAt(0) || '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: isMobile ? '100px' : 'auto' }}>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#1e293b', 
                      fontSize: isMobile ? '0.85rem' : '1.05rem',
                      lineHeight: '1.2',
                      marginBottom: '0.15rem'
                    }}>
                      {registro.empleados?.nombre || 'N/A'} {registro.empleados?.apellido || ''}
                    </div>
                    <div style={{ 
                      fontSize: isMobile ? '0.65rem' : '0.75rem', 
                      color: '#64748b', 
                      textTransform: 'uppercase', 
                      fontWeight: '600', 
                      letterSpacing: '0.02em' 
                    }}>
                      {registro.empleados?.cargo || 'Empleado'}
                    </div>
                  </div>

                  <div style={{ 
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    minWidth: isMobile ? 'auto' : '140px'
                  }}>
                    <div style={{ 
                      fontSize: isMobile ? '0.65rem' : '0.7rem', 
                      color: '#94a3b8', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.25rem'
                    }}>
                      <span>ENT:</span>
                      <span style={{ 
                        color: '#0f172a', 
                        fontFamily: 'monospace', 
                        fontSize: isMobile ? '0.75rem' : '0.85rem',
                        fontWeight: '700'
                      }}>
                        {registro.hora_entrada || '--:--'}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: isMobile ? '0.65rem' : '0.7rem', 
                      color: '#94a3b8', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.25rem'
                    }}>
                      <span>SAL:</span>
                      <span style={{ 
                        color: registro.hora_salida ? '#0f172a' : '#10b981', 
                        fontFamily: 'monospace', 
                        fontSize: isMobile ? '0.75rem' : '0.85rem',
                        fontWeight: '700'
                      }}>
                        {registro.hora_salida || 'EN CURSO'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
