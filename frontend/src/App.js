import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroHorario from './components/RegistroHorario';
import Empleados from './components/Empleados';
import Reportes from './components/Reportes';
import CambiarPassword from './components/CambiarPassword';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Limpieza de Service Workers
    if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(r => r.forEach(sw => sw.unregister()));

    // 2. Carga simple y directa
    const loadSession = () => {
      try {
        // En móviles, a veces localStorage es inestable, probamos sessionStorage primero si es Chrome Mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        let token = localStorage.getItem('token');
        let userStr = localStorage.getItem('user');

        if (isMobile && (!token || !userStr)) {
          token = sessionStorage.getItem('token');
          userStr = sessionStorage.getItem('user');
        }

        if (token && userStr) {
          const userData = JSON.parse(userStr);
          if (userData?.id) {
            setUser(userData);
          }
        }
      } catch (e) {
        console.error('Session load error', e);
      } finally {
        // En móviles damos un poco más de tiempo
        setTimeout(() => setLoading(false), 500);
      }
    };

    loadSession();
  }, []);

  const handleLogin = (userData, token) => {
    // Guardado redundante para asegurar persistencia
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
    } catch (e) { }

    // Actualizar estado
    setUser(userData);

    // Forzar navegación limpia en móviles
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: '#6b7280' }}>Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/registro"
            element={user ? <RegistroHorario user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/empleados"
            element={user ? <Empleados user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/reportes"
            element={user ? <Reportes user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/cambiar-password"
            element={user ? <CambiarPassword user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
