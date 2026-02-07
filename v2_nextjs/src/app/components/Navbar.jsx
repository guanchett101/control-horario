'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function Navbar({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Sincronizar usuario desde localStorage y props
    useEffect(() => {
        setMounted(true);

        // Priorizar prop user, pero verificar localStorage como backup
        if (user) {
            setCurrentUser(user);
        } else {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setCurrentUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing user:', e);
                }
            }
        }
    }, [user]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Evitar hidratación incorrecta
    if (!mounted) {
        return null;
    }

    const isActive = (path) => pathname === path;

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // VISTA MÓVIL CON MENÚ HAMBURGUESA
    if (isMobile) {
        return (
            <div>
                <nav className="navbar fade-in" style={{ position: 'relative', zIndex: 100 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ margin: 0 }}>⏰ Control</h1>
                    </div>

                    <button
                        onClick={toggleMenu}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </nav>

                {/* Overlay para cerrar menú al tocar fuera */}
                {menuOpen && (
                    <div
                        onClick={closeMenu}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 98
                        }}
                    />
                )}

                {/* Menú desplegable móvil */}
                {menuOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '60px',
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            zIndex: 99,
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                    >
                        {currentUser && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                👤 {currentUser.nombre}
                            </div>
                        )}

                        <Link
                            href="/"
                            onClick={closeMenu}
                            style={{
                                background: isActive('/') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>🏠</span> Inicio
                        </Link>

                        <Link
                            href="/registro"
                            onClick={closeMenu}
                            style={{
                                background: isActive('/registro') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>⏱️</span> Fichar
                        </Link>

                        {currentUser?.rol === 'admin' && (
                            <>
                                <Link
                                    href="/empleados"
                                    onClick={closeMenu}
                                    style={{
                                        background: isActive('/empleados') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>👥</span> Empleados
                                </Link>

                                <Link
                                    href="/reportes"
                                    onClick={closeMenu}
                                    style={{
                                        background: isActive('/reportes') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>📊</span> Reportes
                                </Link>

                                <Link
                                    href="/perfiles-turno"
                                    onClick={closeMenu}
                                    style={{
                                        background: isActive('/perfiles-turno') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>⏰</span> Turnos
                                </Link>

                                <Link
                                    href="/visual"
                                    onClick={closeMenu}
                                    style={{
                                        background: isActive('/visual') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🎨</span> Visual
                                </Link>
                            </>
                        )}

                        <Link
                            href="/cambiar-password"
                            onClick={closeMenu}
                            style={{
                                background: isActive('/cambiar-password') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>🔐</span> Contraseña
                        </Link>

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '0.5rem 0' }}></div>

                        <button
                            onClick={() => {
                                closeMenu();
                                handleLogout();
                            }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>🚪</span> Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // VISTA ESCRITORIO (sin cambios)
    return (
        <nav className="navbar fade-in">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>⏰ Control de Horarios</h1>
            </div>

            <div className="navbar-menu" style={{ gap: '0.75rem' }}>
                <Link
                    href="/"
                    style={{
                        background: isActive('/') ? 'rgba(255,255,255,0.15)' : 'transparent',
                    }}
                    title="Inicio"
                >
                    Inicio
                </Link>
                <Link
                    href="/registro"
                    style={{
                        background: isActive('/registro') ? 'rgba(255,255,255,0.15)' : 'transparent',
                    }}
                    title="Fichar"
                >
                    Registro
                </Link>

                {currentUser?.rol === 'admin' && (
                    <>
                        <Link
                            href="/empleados"
                            style={{ background: isActive('/empleados') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Empleados"
                        >
                            Empleados
                        </Link>
                        <Link
                            href="/reportes"
                            style={{ background: isActive('/reportes') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Reportes"
                        >
                            Reportes
                        </Link>
                        <Link
                            href="/perfiles-turno"
                            style={{ background: isActive('/perfiles-turno') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Perfiles de Turno"
                        >
                            Turnos
                        </Link>
                        <Link
                            href="/visual"
                            style={{ background: isActive('/visual') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Personalización Visual"
                        >
                            Visual
                        </Link>
                    </>
                )}

                <Link
                    href="/cambiar-password"
                    style={{ background: isActive('/cambiar-password') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                    title="Seguridad"
                >
                    Contraseña
                </Link>

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>

                {currentUser && (
                    <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'rgba(255,255,255,0.9)',
                        marginRight: '0.5rem'
                    }}>
                        {currentUser.nombre}
                    </span>
                )}

                <button
                    onClick={handleLogout}
                    className="btn btn-logout"
                    title="Cerrar Sesión"
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    Salir
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
