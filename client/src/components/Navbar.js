import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <h1>Control de Horarios</h1>
      <div className="navbar-menu">
        <Link to="/">Inicio</Link>
        <Link to="/registro">Registro</Link>
        {user.rol === 'admin' && (
          <>
            <Link to="/empleados">Empleados</Link>
            <Link to="/reportes">Reportes</Link>
          </>
        )}
        <span style={{marginLeft: '1rem'}}>{user.nombre}</span>
        <button onClick={onLogout} className="btn btn-logout">Salir</button>
      </div>
    </nav>
  );
}

export default Navbar;
