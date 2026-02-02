import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar fade-in">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>
          {isMobile ? '⏰ Control' : '⏰ Control de Horarios'}
        </h1>
      </div>

      <div className="navbar-menu" style={{ gap: isMobile ? '0.25rem' : '0.75rem' }}>
        <Link
          to="/"
          style={{
            background: isActive('/') ? 'rgba(255,255,255,0.15)' : 'transparent',
          }}
          title="Inicio"
        >
          {isMobile ? '🏠' : 'Inicio'}
        </Link>
        <Link
          to="/registro"
          style={{
            background: isActive('/registro') ? 'rgba(255,255,255,0.15)' : 'transparent',
          }}
          title="Fichar"
        >
          {isMobile ? '⏱️' : 'Registro'}
        </Link>

        {user?.rol === 'admin' && (
          <>
            <Link
              to="/empleados"
              style={{ background: isActive('/empleados') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
              title="Empleados"
            >
              {isMobile ? '👥' : 'Empleados'}
            </Link>
            <Link
              to="/reportes"
              style={{ background: isActive('/reportes') ? 'rgba(255,255,255,0.15)' : 'transparent' }}
              title="Reportes"
            >
              {isMobile ? '📊' : 'Reportes'}
            </Link>
          </>
        )}

        {/* Separador visual en desktop */}
        {!isMobile && <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>}

        {!isMobile && (
          <span style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            marginRight: '0.5rem'
          }}>
            {user?.nombre}
          </span>
        )}

        <button
          onClick={onLogout}
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
