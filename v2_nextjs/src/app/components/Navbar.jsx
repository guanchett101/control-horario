'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function Navbar({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [mounted, setMounted] = useState(false);
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

    // Handle logout internally if no prop provided, but usually parent handles it.
    // We keep onLogout prop for compatibility if parent manages state.
    // If we wanted to make Navbar self-sufficient:
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
    };

    return (
        <nav className="navbar fade-in">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>
                    {isMobile ? '⏰ Control' : '⏰ Control de Horarios'}
                </h1>
            </div>

            <div className="navbar-menu" style={{ gap: isMobile ? '0.25rem' : '0.75rem' }}>
                <Link
                    href="/"
                    style={{
                        background: isActive('/') ? 'rgba(255,255,255,0.15)' : 'transparent',
                    }}
                    title="Inicio"
                >
                    {isMobile ? '🏠' : 'Inicio'}
                </Link>
                <Link
                    href="/registro"
                    style={{
                        background: isActive('/registro') ? 'rgba(255,255,255,0.15)' : 'transparent',
                    }}
                    title="Fichar"
                >
                    {isMobile ? '⏱️' : 'Registro'}
                </Link>

                {currentUser?.rol === 'admin' && (
                    <>
                        <Link
                            href="/empleados"
                            style={{ background: isActive('/empleados') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Empleados"
                        >
                            {isMobile ? '👥' : 'Empleados'}
                        </Link>
                        <Link
                            href="/reportes"
                            style={{ background: isActive('/reportes') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Reportes"
                        >
                            {isMobile ? '📊' : 'Reportes'}
                        </Link>
                        <Link
                            href="/perfiles-turno"
                            style={{ background: isActive('/perfiles-turno') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Perfiles de Turno"
                        >
                            {isMobile ? '⏰' : 'Turnos'}
                        </Link>
                        <Link
                            href="/visual"
                            style={{ background: isActive('/visual') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                            title="Personalización Visual"
                        >
                            {isMobile ? '🎨' : 'Visual'}
                        </Link>
                    </>
                )}

                <Link
                    href="/cambiar-password"
                    style={{ background: isActive('/cambiar-password') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                    title="Seguridad"
                >
                    {isMobile ? '🔐' : 'Contraseña'}
                </Link>

                {/* Separador visual en desktop */}
                {!isMobile && <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>}

                {!isMobile && currentUser && (
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
                        minWidth: isMobile ? '40px' : 'auto',
                        height: isMobile ? '40px' : 'auto',
                        borderRadius: isMobile ? '50%' : '10px',
                        padding: isMobile ? '0' : '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '0.25rem'
                    }}
                >
                    {isMobile ? '🚪' : 'Salir'}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
