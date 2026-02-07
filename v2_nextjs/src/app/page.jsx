'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';

const API_URL = '/api';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [registrosHoy, setRegistrosHoy] = useState([]);
    const [loading, setLoading] = useState(true); // Start loading true
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [horaActual, setHoraActual] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);

    // Authentication Check
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            router.push('/login');
        } else {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                router.push('/login');
            }
        }
    }, [router]);

    // Load Data only if user is set
    useEffect(() => {
        if (!user) return;

        // Detectar si es móvil
        const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(checkMobile);

        const interval = setInterval(() => setHoraActual(new Date()), 1000);

        // Cargar registros
        cargarRegistrosHoy();

        return () => {
            clearInterval(interval);
        };
    }, [user]);

    const cargarRegistrosHoy = async () => {
        try {
            const token = localStorage.getItem('token');
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
            if (error.response?.data) {
                setDebugInfo(error.response.data);
            }
            if (error.name !== 'CanceledError') { // Axios cancel uses this name
                setError('Error cargando datos. Revisa tu conexión.');
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
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
    };

    const formatearFecha = (fecha) => {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
    };

    if (!user) {
        return null; // or loading spinner while redirecting
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar user={user} />

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
                    {/* ... (Header Content Same as before) ... */}
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
                        <strong>{error}</strong>
                        <button
                            onClick={() => {
                                setLoading(true);
                                setError(null);
                                cargarRegistrosHoy();
                            }}
                            className="btn btn-danger"
                            style={{ alignSelf: 'flex-end' }}
                        >
                            🔄 Reintentar
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: isMobile ? '0.75rem' : '1.25rem',
                    marginBottom: '1.5rem'
                }}>
                    <div className="card" style={{ 
                        padding: isMobile ? '1.25rem' : '1.5rem', 
                        marginBottom: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: isMobile ? '0.75rem' : '1rem' 
                    }}>
                        <div style={{ 
                            fontSize: isMobile ? '1.25rem' : '1.5rem', 
                            background: '#10b981', 
                            color: 'white', 
                            width: isMobile ? 40 : 48, 
                            height: isMobile ? 40 : 48, 
                            minWidth: isMobile ? 40 : 48,
                            borderRadius: 8, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>✓</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#6b7280' }}>Presentes</div>
                            <div style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: '600' }}>{empleadosPresentes}</div>
                        </div>
                    </div>

                    <div className="card" style={{ 
                        padding: isMobile ? '1.25rem' : '1.5rem', 
                        marginBottom: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: isMobile ? '0.75rem' : '1rem' 
                    }}>
                        <div style={{ 
                            fontSize: isMobile ? '1.25rem' : '1.5rem', 
                            background: '#ef4444', 
                            color: 'white', 
                            width: isMobile ? 40 : 48, 
                            height: isMobile ? 40 : 48, 
                            minWidth: isMobile ? 40 : 48,
                            borderRadius: 8, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>←</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#6b7280' }}>Salieron</div>
                            <div style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: '600' }}>{empleadosSalieron}</div>
                        </div>
                    </div>

                    <div className="card" style={{ 
                        padding: isMobile ? '1.25rem' : '1.5rem', 
                        marginBottom: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: isMobile ? '0.75rem' : '1rem' 
                    }}>
                        <div style={{ 
                            fontSize: isMobile ? '1.25rem' : '1.5rem', 
                            background: '#3b82f6', 
                            color: 'white', 
                            width: isMobile ? 40 : 48, 
                            height: isMobile ? 40 : 48, 
                            minWidth: isMobile ? 40 : 48,
                            borderRadius: 8, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>#</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#6b7280' }}>Total Hoy</div>
                            <div style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: '600' }}>{totalRegistros}</div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="card" style={{ padding: isMobile ? '1.25rem' : '1.75rem', marginBottom: '2rem' }}>
                    <h3 style={{ 
                        margin: '0 0 1.25rem 0', 
                        fontSize: isMobile ? '1rem' : '1.125rem', 
                        fontWeight: '600' 
                    }}>
                        {user?.rol === 'admin' ? 'Panel de Administración' : 'Acciones Rápidas'}
                    </h3>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: isMobile ? '0.75rem' : '1rem' 
                    }}>
                        {/* BOTÓN FICHAR - SOLO PARA NO ADMINS */}
                        {user?.rol !== 'admin' && (
                            <Link href="/registro" style={{
                                textDecoration: 'none',
                                background: '#fbbf24',
                                color: '#1e3a8a',
                                padding: isMobile ? '1.25rem' : '1.75rem',
                                borderRadius: isMobile ? '12px' : '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: isMobile ? '0.75rem' : '1.25rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                fontSize: isMobile ? '1rem' : '1.2rem',
                                transition: 'transform 0.2s'
                            }}>
                                <span style={{ fontSize: isMobile ? '1.75rem' : '2rem' }}>⏱️</span>
                                <div>{isMobile ? 'FICHAR' : 'REGISTRAR HORARIO'}</div>
                            </Link>
                        )}

                        {/* BOTONES ADMIN - REEMPLAZAN AL DE FICHAR */}
                        {user?.rol === 'admin' && (
                            <>
                                <Link href="/empleados" style={{
                                    textDecoration: 'none',
                                    background: '#10b981',
                                    color: 'white',
                                    padding: isMobile ? '1.25rem' : '1.75rem',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: isMobile ? '0.75rem' : '1.25rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    fontSize: isMobile ? '0.95rem' : '1.1rem',
                                    transition: 'transform 0.2s'
                                }}>
                                    <span style={{ fontSize: isMobile ? '1.75rem' : '2rem' }}>👥</span>
                                    <div>{isMobile ? 'EMPLEADOS' : 'GESTIONAR USUARIOS'}</div>
                                </Link>

                                <Link href="/reportes" style={{
                                    textDecoration: 'none',
                                    background: '#3b82f6',
                                    color: 'white',
                                    padding: isMobile ? '1.25rem' : '1.75rem',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: isMobile ? '0.75rem' : '1.25rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    fontSize: isMobile ? '0.95rem' : '1.1rem',
                                    transition: 'transform 0.2s'
                                }}>
                                    <span style={{ fontSize: isMobile ? '1.75rem' : '2rem' }}>📊</span>
                                    <div>{isMobile ? 'REPORTES' : 'VER REPORTES'}</div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Lista Registros */}
                <div className="card" style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
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
                            fontWeight: '800' 
                        }}>
                            {user?.rol === 'admin' ? '📋 Actividad de Hoy' : '📋 Tus Registros de Hoy'}
                        </h3>
                        <button 
                            onClick={() => { setLoading(true); cargarRegistrosHoy(); }} 
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontSize: isMobile ? '1rem' : '1.2rem',
                                padding: '0.25rem'
                            }}
                        >🔄</button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: isMobile ? '1.5rem' : '2rem' }}>Cargando...</div>
                    ) : registrosHoy.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: isMobile ? '1.5rem' : '2rem', color: '#9ca3af' }}>
                            <div style={{ fontSize: isMobile ? '2.5rem' : '3rem', marginBottom: '0.5rem', opacity: 0.5 }}>🍃</div>
                            <p style={{ fontSize: isMobile ? '0.9rem' : '1rem', margin: 0 }}>No hay registros hoy.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.5rem' : '0.75rem' }}>
                            {registrosHoy.map(r => (
                                <div key={r.id} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    padding: isMobile ? '0.75rem' : '1rem', 
                                    background: '#f8fafc', 
                                    borderRadius: isMobile ? '10px' : '12px', 
                                    alignItems: 'center',
                                    gap: isMobile ? '0.5rem' : '1rem',
                                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                                }}>
                                    <div style={{ display: 'flex', gap: isMobile ? '0.75rem' : '1rem', alignItems: 'center', flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
                                        <div style={{ 
                                            width: isMobile ? 36 : 40, 
                                            height: isMobile ? 36 : 40, 
                                            minWidth: isMobile ? 36 : 40,
                                            borderRadius: '50%', 
                                            background: r.hora_salida ? '#ef4444' : '#10b981', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontWeight: 'bold',
                                            color: 'white',
                                            fontSize: isMobile ? '0.75rem' : '0.9rem'
                                        }}>
                                            {r.empleados?.nombre?.[0]}{r.empleados?.apellido?.[0]}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ 
                                                fontWeight: 'bold', 
                                                fontSize: isMobile ? '0.9rem' : '1rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {r.empleados?.nombre} {r.empleados?.apellido}
                                            </div>
                                            <div style={{ 
                                                fontSize: isMobile ? '0.7rem' : '0.8rem', 
                                                color: '#64748b',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {r.empleados?.cargo}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        textAlign: 'right', 
                                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.15rem',
                                        minWidth: isMobile ? 'auto' : '120px'
                                    }}>
                                        <div style={{ 
                                            color: '#059669', 
                                            fontFamily: 'monospace',
                                            fontWeight: '600',
                                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                                        }}>
                                            <span style={{ color: '#9ca3af', fontSize: isMobile ? '0.65rem' : '0.7rem' }}>ENT:</span> {r.hora_entrada}
                                        </div>
                                        {r.hora_salida && (
                                            <div style={{ 
                                                color: '#dc2626', 
                                                fontFamily: 'monospace',
                                                fontWeight: '600',
                                                fontSize: isMobile ? '0.75rem' : '0.85rem'
                                            }}>
                                                <span style={{ color: '#9ca3af', fontSize: isMobile ? '0.65rem' : '0.7rem' }}>SAL:</span> {r.hora_salida}
                                            </div>
                                        )}
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
