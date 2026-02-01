import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Reportes({ user, onLogout }) {
  const [empleadoId, setEmpleadoId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarRegistros = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/registros/empleado/${empleadoId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      setRegistros(response.data);
    } catch (error) {
      alert('Error al buscar registros');
    } finally {
      setLoading(false);
    }
  };

  const calcularHoras = (entrada, salida) => {
    if (!entrada || !salida) return '-';
    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = salida.split(':').map(Number);
    const minutos = (hS * 60 + mS) - (hE * 60 + mE);
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container">
        <h2>Reportes de Horarios</h2>
        
        <div className="card">
          <h3>Buscar Registros</h3>
          <form onSubmit={buscarRegistros}>
            <div className="form-group">
              <label>ID Empleado</label>
              <input
                type="number"
                value={empleadoId}
                onChange={(e) => setEmpleadoId(e.target.value)}
                required
              />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {registros.length > 0 && (
          <div className="card">
            <h3>Resultados</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Empleado</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Horas</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((reg) => (
                  <tr key={reg.id}>
                    <td>{new Date(reg.fecha).toLocaleDateString()}</td>
                    <td>{reg.empleados.nombre} {reg.empleados.apellido}</td>
                    <td>{reg.hora_entrada || '-'}</td>
                    <td>{reg.hora_salida || '-'}</td>
                    <td>{calcularHoras(reg.hora_entrada, reg.hora_salida)}</td>
                    <td>{reg.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reportes;
