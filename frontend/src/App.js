import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroHorario from './components/RegistroHorario';
import Empleados from './components/Empleados';
import Reportes from './components/Reportes';
import CambiarPassword from './components/CambiarPassword';
import storage from './utils/storage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const token = await storage.getItem('token');
      const userData = await storage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id && parsedUser.nombre) {
          setUser(parsedUser);
        } else {
          await storage.clear();
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      await storage.clear();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData, token) => {
    try {
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      alert('Error al iniciar sesión. Por favor, intenta de nuevo.');
    }
  };

  const handleLogout = async () => {
    await storage.clear();
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
