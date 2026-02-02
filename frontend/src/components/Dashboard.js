import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Dashboard({ user, onLogout }) {
  const [registrosHoy, setRegistrosHoy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

      // Timeout de 10 segundos para móviles lentos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.get(`${API_URL}/registros/hoy`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      setRegistrosHoy(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar registros:', error);
      if (error.name === 'AbortError') {
        setError('Conexión lenta - Intenta recargar');
      } else {
        setError('No se pudieron cargar los registros');
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
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991b1b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span>⚠️ {error}</span>
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
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔄 Reintentar
            </button>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: isMobile ? '0.75rem' : '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Presentes
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827' }}>
                  {empleadosPresentes}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white'
              }}>
                ←
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Salieron
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827' }}>
                  {empleadosSalieron}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white'
              }}>
                #
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Total Hoy
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827' }}>
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
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            Acciones Rápidas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link to="/registro" style={{
              textDecoration: 'none',
              background: '#1e3c72',
              color: 'white',
              padding: '1.25rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 60, 114, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
              }}>
              <span style={{ fontSize: '1.75rem' }}>⏰</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Registrar Horario</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Entrada/Salida</div>
              </div>
            </Link>

            {user?.rol === 'admin' && (
              <>
                <Link to="/empleados" style={{
                  textDecoration: 'none',
                  background: '#10b981',
                  color: 'white',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
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
                  <span style={{ fontSize: '1.75rem' }}>👥</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Empleados</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Gestionar</div>
                  </div>
                </Link>

                <Link to="/reportes" style={{
                  textDecoration: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
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
                  <span style={{ fontSize: '1.75rem' }}>📊</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Reportes</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Ver estadísticas</div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Registros de Hoy */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            Actividad de Hoy
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              Cargando registros...
            </div>
          ) : registrosHoy.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ margin: 0 }}>No hay registros para hoy</p>
            </div>
          ) : (
            <div className="table-responsive">
              {registrosHoy.slice(0, isMobile ? 5 : registrosHoy.length).map((registro) => (
                <div key={registro.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '0.75rem' : '1rem',
                  borderBottom: '1px solid #f3f4f6',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{
                      width: isMobile ? '36px' : '42px',
                      height: isMobile ? '36px' : '42px',
                      borderRadius: '8px',
                      background: registro.hora_salida ? '#ef4444' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: isMobile ? '0.85rem' : '1rem'
                    }}>
                      {registro.empleados?.nombre?.charAt(0) || '?'}{registro.empleados?.apellido?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                        {registro.empleados?.nombre || 'N/A'} {registro.empleados?.apellido || ''}
                      </div>
                      {!isMobile && (
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {registro.empleados?.cargo || 'Sin cargo'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: isMobile ? '1rem' : '2rem', alignItems: 'center', fontSize: isMobile ? '0.85rem' : '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                        Entrada
                      </div>
                      <div style={{ fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>
                        {registro.hora_entrada || '-'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                        Salida
                      </div>
                      <div style={{ fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>
                        {registro.hora_salida || '-'}
                      </div>
                    </div>
                    {!isMobile && (
                      <div>
                        {registro.hora_salida ? (
                          <span style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            Salió
                          </span>
                        ) : (
                          <span style={{
                            background: '#d1fae5',
                            color: '#059669',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            Presente
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isMobile && registrosHoy.length > 5 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                  Mostrando 5 de {registrosHoy.length} registros
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
