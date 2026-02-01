import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Dashboard({ user, onLogout }) {
  const [registrosHoy, setRegistrosHoy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRegistrosHoy();
  }, []);

  const cargarRegistrosHoy = async () => {
    try {
      const response = await axios.get(`${API_URL}/registros/hoy`);
      setRegistrosHoy(response.data);
    } catch (error) {
      console.error('Error al cargar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const empleadosPresentes = registrosHoy.filter(r => r.hora_entrada && !r.hora_salida).length;
  const totalRegistros = registrosHoy.length;

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container">
        <h2>Bienvenido, {user.nombre} {user.apellido}</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Empleados Presentes</h3>
            <div className="value">{empleadosPresentes}</div>
          </div>
          
          <div className="stat-card">
            <h3>Registros Hoy</h3>
            <div className="value">{totalRegistros}</div>
          </div>
        </div>

        <div className="card">
          <h3>Registros de Hoy</h3>
          
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : registrosHoy.length === 0 ? (
            <p>No hay registros para hoy</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Cargo</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {registrosHoy.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.empleados.nombre} {registro.empleados.apellido}</td>
                    <td>{registro.empleados.cargo}</td>
                    <td>{registro.hora_entrada || '-'}</td>
                    <td>{registro.hora_salida || '-'}</td>
                    <td>
                      {registro.hora_salida ? (
                        <span style={{color: '#e74c3c'}}>Salió</span>
                      ) : (
                        <span style={{color: '#27ae60'}}>Presente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Acciones Rápidas</h3>
          <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
            <Link to="/registro" className="btn btn-primary">Registrar Horario</Link>
            {user.rol === 'admin' && (
              <>
                <Link to="/empleados" className="btn btn-success">Gestionar Empleados</Link>
                <Link to="/reportes" className="btn btn-primary">Ver Reportes</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
