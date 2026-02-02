import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  return (
    <nav className="navbar" style={{ padding: isMobile ? '0.5rem 1rem' : '1rem 1.5rem' }}>
      <h1 style={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
        {isMobile ? '⏰ Control' : '⏰ Control de Horarios'}
      </h1>
      <div className="navbar-menu" style={{ gap: isMobile ? '0.4rem' : '0.75rem' }}>
        <Link to="/" style={{ padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 0.75rem' }}>
          {isMobile ? '🏠' : 'Inicio'}
        </Link>
        <Link to="/registro" style={{ padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 0.75rem' }}>
          {isMobile ? '⏰' : 'Registro'}
        </Link>
        {user?.rol === 'admin' && (
          <>
            <Link to="/empleados" style={{ padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 0.75rem' }}>
              {isMobile ? '👥' : 'Empleados'}
            </Link>
            <Link to="/reportes" style={{ padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 0.75rem' }}>
              {isMobile ? '📊' : 'Reportes'}
            </Link>
          </>
        )}
        {!isMobile && <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }}>{user?.nombre}</span>}
        <button
          onClick={onLogout}
          className="btn btn-logout"
          style={{
            padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 0.8rem',
            fontSize: isMobile ? '0.75rem' : '0.8rem'
          }}
        >
          {isMobile ? '🚪' : 'Salir'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
