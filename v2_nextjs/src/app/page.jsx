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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [horaActual, setHoraActual] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [stats, setStats] = useState({
        totalEmpleados: 0,
        presentes: 0,
        ausentes: 0,
        salieron: 0
    });

    // Primer useEffect: Cargar usuario desde localStorage
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!storedUser || !token) {
                router.push('/login');
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        } catch (e) {
            console.error('Error al cargar usuario:', e);
            router.push('/login');
        }
    }, [router]);

    // Segundo useEffect: Detectar móvil y configurar reloj
    useEffect(() => {
        try {
            const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(checkMobile);
            setIsReady(true);

            const interval = setInterval(() => {
                setHoraActual(new Date());
            }, 1000);

            return () => clearInterval(interval);
        } catch (e) {
            console.error('Error en configuración inicial:', e);
            setIsReady(true);
        }
    }, []);

    // Tercer useEffect: Cargar datos cuando user esté disponible
    useEffect(() => {
        if (!user || !user.rol || !isReady) return;

        let isMounted = true; // Prevenir actualizaciones si el componente se desmonta

        const cargarDatos = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                // PASO 1: Cargar registros
                let url = `${API_URL}/registros?action=hoy`;
                if (user.rol !== 'admin') {
                    const fechaHoy = new Date().toISOString().split('T')[0];
                    url = `${API_URL}/registros?action=empleado&id=${user.empleadoId}&fechaInicio=${fechaHoy}&fechaFin=${fechaHoy}`;
                }

                const response = await axios.get(url, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    timeout: 10000
                });

                if (!isMounted) return; // Componente desmontado, salir

                const registros = Array.isArray(response.data) ? response.data : [];
                setRegistrosHoy(registros);

                // PASO 2: Solo si es admin, cargar empleados (DESPUÉS de registros)
                if (user.rol === 'admin') {
                    const presentes = registros.filter(r => r.hora_entrada && !r.hora_salida).length;
                    const salieron = registros.filter(r => r.hora_salida).length;

                    // Pequeña pausa para evitar sobrecarga en móvil
                    await new Promise(resolve => setTimeout(resolve, 100));

                    if (!isMounted) return;

                    try {
                        const empResponse = await axios.get(`${API_URL}/empleados`, {
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                            timeout: 10000
                        });

                        if (!isMounted) return;

                        const totalEmpleados = Array.isArray(empResponse.data) ? empResponse.data.length : 0;

                        setStats({
                            totalEmpleados,
                            presentes,
                            ausentes: Math.max(0, totalEmpleados - presentes - salieron),
                            salieron
                        });
                    } catch (empError) {
                        console.error('Error al cargar empleados:', empError);
                        // Establecer stats con datos parciales
                        if (isMounted) {
                            setStats({
                                totalEmpleados: 0,
                                presentes,
                                ausentes: 0,
                                salieron
                            });
                        }
                    }
                }

                if (isMounted) {
                    setError(null);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                if (isMounted) {
                    setError('Error cargando datos. Por favor, recarga la página.');
                    setRegistrosHoy([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        cargarDatos();

        return () => {
            isMounted = false; // Cleanup: marcar como desmontado
        };
    }, [user, isReady]);

    const recargarDatos = async () => {
        if (!user || !user.rol) {
            console.warn('No se puede recargar: usuario no disponible');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // PASO 1: Cargar registros
            let url = `${API_URL}/registros?action=hoy`;
            if (user.rol !== 'admin') {
                const fechaHoy = new Date().toISOString().split('T')[0];
                url = `${API_URL}/registros?action=empleado&id=${user.empleadoId}&fechaInicio=${fechaHoy}&fechaFin=${fechaHoy}`;
            }

            const response = await axios.get(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                timeout: 10000
            });

            const registros = Array.isArray(response.data) ? response.data : [];
            setRegistrosHoy(registros);

            // PASO 2: Solo si es admin, cargar empleados (DESPUÉS de registros)
            if (user.rol === 'admin') {
                const presentes = registros.filter(r => r.hora_entrada && !r.hora_salida).length;
                const salieron = registros.filter(r => r.hora_salida).length;

                // Pequeña pausa para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 100));

                try {
                    const empResponse = await axios.get(`${API_URL}/empleados`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                        timeout: 10000
                    });
                    const totalEmpleados = Array.isArray(empResponse.data) ? empResponse.data.length : 0;

                    setStats({
                        totalEmpleados,
                        presentes,
                        ausentes: Math.max(0, totalEmpleados - presentes - salieron),
                        salieron
                    });
                } catch (empError) {
                    console.error('Error al cargar empleados:', empError);
                    // Establecer stats con datos parciales
                    setStats({
                        totalEmpleados: 0,
                        presentes,
                        ausentes: 0,
                        salieron
                    });
                }
            }

            setError(null);
        } catch (error) {
            console.error('Error al recargar datos:', error);
            setError('Error al recargar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const formatearHora = (fecha) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
    };

    const formatearFecha = (fecha) => {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
    };

    if (!isReady || isMobile === null) {
        return (
            <div style={{
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: '#6b7280' }}>Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // VISTA PARA EMPLEADOS (NO ADMIN)
    if (user?.rol !== 'admin') {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar user={user} />
                <div className="container" style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: isMobile ? '0.75rem' : '1.5rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                        borderRadius: '8px',
                        padding: isMobile ? '1.5rem' : '2rem',
                        color: 'white',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
                                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '700' }}>
                                    Hola, {user?.nombre || 'Usuario'}
                                </h1>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                                    {formatearFecha(horaActual)}
                                </p>
                            </div>
                            <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                                <div style={{ fontSize: isMobile ? '2.5rem' : '3rem', fontWeight: '700', lineHeight: 1, fontFamily: 'monospace' }}>
                                    {formatearHora(horaActual)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/registro" className="hover-lift" style={{
                        textDecoration: 'none',
                        display: 'block',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: '#1e3a8a',
                        padding: isMobile ? '2rem' : '3rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: isMobile ? '1.5rem' : '2rem',
                        boxShadow: '0 8px 16px rgba(251, 191, 36, 0.3)',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ fontSize: isMobile ? '3rem' : '4rem', marginBottom: '0.5rem' }}>⏱️</div>
                        REGISTRAR HORARIO
                    </Link>

                    <div className="card" style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: '700', color: '#111827' }}>
                            📋 Tus Registros de Hoy
                        </h3>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Cargando...</div>
                        ) : registrosHoy.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🍃</div>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay registros hoy</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {registrosHoy.map(r => (
                                    <div key={r.id} style={{
                                        padding: '1.5rem',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>
                                                {new Date(r.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                            <span style={{
                                                background: r.hora_salida ? '#fee2e2' : '#d1fae5',
                                                color: r.hora_salida ? '#991b1b' : '#065f46',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {r.hora_salida ? 'COMPLETADO' : 'EN CURSO'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Entrada</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669', fontFamily: 'monospace' }}>
                                                    {r.hora_entrada}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Salida</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: r.hora_salida ? '#dc2626' : '#d1d5db', fontFamily: 'monospace' }}>
                                                    {r.hora_salida || '--:--'}
                                                </div>
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

    // VISTA PARA ADMIN - DASHBOARD PROFESIONAL
    // FORZAR RENDER CLIENT-ONLY O SUPRIMIR WARNINGS para evitar Hydration Error en móvil

    // Si aún no está listo el cliente, mostramos loader para evitar mismatch
    if (!isReady) return null;

    return (
        <div suppressHydrationWarning={true} style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar user={user} />

            <div className="container" style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: isMobile ? '0.75rem' : '1.5rem'
            }}>
                {/* Header Profesional */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    borderRadius: '12px',
                    padding: isMobile ? '1.5rem' : '2.5rem',
                    color: 'white',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '1.5rem'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Panel de Administración
                            </div>
                            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '700' }}>
                                Bienvenido, {user?.nombre}
                            </h1>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
                                {formatearFecha(horaActual)}
                            </p>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            padding: '1.5rem 2rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Hora Actual
                            </div>
                            <div style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '700', lineHeight: 1, fontFamily: 'monospace' }}>
                                {formatearHora(horaActual)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas en Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div className="stat-card" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                👥
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Total Empleados
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', lineHeight: 1 }}>
                            {stats.totalEmpleados}
                        </div>
                    </div>

                    <div className="stat-card" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                ✓
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Presentes Ahora
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981', lineHeight: 1 }}>
                            {stats.presentes}
                        </div>
                    </div>

                    <div className="stat-card" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                ⏸
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Sin Fichar
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b', lineHeight: 1 }}>
                            {stats.ausentes}
                        </div>
                    </div>

                    <div className="stat-card" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                ←
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Ya Salieron
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ef4444', lineHeight: 1 }}>
                            {stats.salieron}
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: isMobile ? '1.5rem' : '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>⚡</span> Acciones Rápidas
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: '1.5rem'
                    }}>
                        <Link href="/empleados" className="action-card" style={{
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            fontSize: '1.1rem'
                        }}>
                            <div style={{ fontSize: '3rem' }}>👥</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Gestionar Empleados</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
                                    Crear, editar y administrar
                                </div>
                            </div>
                        </Link>

                        <Link href="/reportes" className="action-card" style={{
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            padding: '2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            fontSize: '1.1rem'
                        }}>
                            <div style={{ fontSize: '3rem' }}>📊</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Ver Reportes</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
                                    Análisis y estadísticas
                                </div>
                            </div>
                        </Link>

                        <Link href="/perfiles-turno" className="action-card" style={{
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            color: 'white',
                            padding: '2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            fontSize: '1.1rem'
                        }}>
                            <div style={{ fontSize: '3rem' }}>⏰</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Perfiles de Turno</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
                                    Configurar horarios
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: '1.5rem',
                        marginTop: '1.5rem'
                    }}>
                        <Link href="/registro" className="action-card-small" style={{
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>⏱️</div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: '700' }}>Registro Manual</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.15rem' }}>
                                    Fichar entrada/salida
                                </div>
                            </div>
                        </Link>

                        <Link href="/visual" className="action-card-small" style={{
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>🎨</div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: '700' }}>Personalización</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.15rem' }}>
                                    Ajustes visuales
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Actividad Reciente */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: isMobile ? '1.5rem' : '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#111827',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>📋</span> Actividad de Hoy
                        </h3>
                        <button
                            onClick={recargarDatos}
                            className="refresh-btn"
                            style={{
                                background: '#f3f4f6',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px'
                            }}
                        >
                            🔄
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                border: '4px solid #e5e7eb',
                                borderTop: '4px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 1rem'
                            }}></div>
                            Cargando actividad...
                        </div>
                    ) : registrosHoy.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🍃</div>
                            <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: '500', color: '#6b7280' }}>
                                No hay actividad registrada hoy
                            </p>
                            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0', color: '#9ca3af' }}>
                                Los fichajes aparecerán aquí en tiempo real
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {registrosHoy.filter(r => r && typeof r === 'object').slice(0, 10).map((r, index) => (
                                <div key={r.id || index} className="activity-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            minWidth: 48,
                                            borderRadius: '12px',
                                            background: r.hora_salida
                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '700',
                                            color: 'white',
                                            fontSize: '1rem',
                                            boxShadow: r.hora_salida
                                                ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                                                : '0 4px 12px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            {(r.empleados?.nombre?.[0] || '?')}{(r.empleados?.apellido?.[0] || '')}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '1rem',
                                                color: '#111827',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {r.empleados?.nombre || 'Empleado'} {r.empleados?.apellido || 'Desconocido'}
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: '#6b7280',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span>{r.empleados?.cargo || 'Sin cargo'}</span>
                                                <span style={{
                                                    background: r.hora_salida ? '#fee2e2' : '#d1fae5',
                                                    color: r.hora_salida ? '#991b1b' : '#065f46',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {r.hora_salida ? 'Salió' : 'Presente'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        textAlign: 'right',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                    }}>
                                        <div style={{
                                            color: '#059669',
                                            fontFamily: 'monospace',
                                            fontWeight: '700',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500' }}>ENT </span>
                                            {r.hora_entrada}
                                        </div>
                                        {r.hora_salida && (
                                            <div style={{
                                                color: '#dc2626',
                                                fontFamily: 'monospace',
                                                fontWeight: '700',
                                                fontSize: '0.95rem'
                                            }}>
                                                <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500' }}>SAL </span>
                                                {r.hora_salida}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {registrosHoy.length > 10 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '1rem',
                                    color: '#6b7280',
                                    fontSize: '0.9rem'
                                }}>
                                    Mostrando 10 de {registrosHoy.length} registros.
                                    <Link href="/reportes" style={{ color: '#3b82f6', marginLeft: '0.5rem', fontWeight: '600' }}>
                                        Ver todos →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
