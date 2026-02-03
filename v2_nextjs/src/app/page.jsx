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
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: isMobile ? '0.75rem' : '1.25rem',
                    marginBottom: '1.5rem'
                }}>
                    <div className="card" style={{ padding: '1.5rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', background: '#10b981', color: 'white', width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Presentes</div>
                            <div style={{ fontSize: '1.875rem', fontWeight: '600' }}>{empleadosPresentes}</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', background: '#ef4444', color: 'white', width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Salieron</div>
                            <div style={{ fontSize: '1.875rem', fontWeight: '600' }}>{empleadosSalieron}</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', background: '#3b82f6', color: 'white', width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>#</div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Hoy</div>
                            <div style={{ fontSize: '1.875rem', fontWeight: '600' }}>{totalRegistros}</div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.125rem', fontWeight: '600' }}>Acciones Rápidas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <Link href="/registro" style={{
                            textDecoration: 'none',
                            background: '#fbbf24',
                            color: '#1e3a8a',
                            padding: '1.75rem',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1.25rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <span style={{ fontSize: '2rem' }}>⏱️</span>
                            <div>FICHAR</div>
                        </Link>

                        {user?.rol === 'admin' && (
                            <>
                                <Link href="/empleados" className="btn btn-success" style={{ height: '100%', fontSize: '1.1rem', textDecoration: 'none' }}>
                                    👥 Empleados
                                </Link>
                                <Link href="/reportes" className="btn btn-primary" style={{ height: '100%', fontSize: '1.1rem', textDecoration: 'none' }}>
                                    📊 Reportes
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Lista Registros */}
                <div className="card" style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                            Actividad de {user?.rol === 'admin' ? 'Hoy' : 'Tus Registros de Hoy'}
                        </h3>
                        <button onClick={() => { setLoading(true); cargarRegistrosHoy(); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🔄</button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
                    ) : registrosHoy.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No hay registros hoy.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {registrosHoy.map(r => (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {r.empleados?.nombre?.[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{r.empleados?.nombre} {r.empleados?.apellido}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.empleados?.cargo}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                                        <div style={{ color: '#059669' }}>Entrada: {r.hora_entrada}</div>
                                        {r.hora_salida && <div style={{ color: '#dc2626' }}>Salida: {r.hora_salida}</div>}
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
