import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Empleados({ user, onLogout }) {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    username: '',
    password: ''
  });

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const response = await axios.get(`${API_URL}/empleados`);
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Crear empleado
      const empleadoResponse = await axios.post(`${API_URL}/empleados`, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        cargo: formData.cargo,
        fechaIngreso: formData.fechaIngreso
      });

      // Crear usuario para el empleado
      if (formData.username && formData.password) {
        await axios.post(`${API_URL}/auth/register`, {
          empleadoId: empleadoResponse.data.id,
          username: formData.username,
          password: formData.password,
          rol: 'empleado'
        });
      }

      alert('Empleado y usuario creados exitosamente');
      setShowForm(false);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cargo: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        username: '',
        password: ''
      });
      cargarEmpleados();
    } catch (error) {
      alert('Error al crear empleado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h2>Gestión de Empleados</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancelar' : 'Nuevo Empleado'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h3>Nuevo Empleado</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Ingreso</label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleChange}
                  required
                />
              </div>

              <hr style={{margin: '1.5rem 0'}} />
              <h4>Credenciales de Acceso</h4>
              
              <div className="form-group">
                <label>Usuario (para login)</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ej: juan.perez"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-success">Guardar Empleado y Usuario</button>
            </form>
          </div>
        )}

        <div className="card">
          <h3>Lista de Empleados</h3>
          
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Cargo</th>
                  <th>Fecha Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.nombre} {emp.apellido}</td>
                    <td>{emp.email || '-'}</td>
                    <td>{emp.telefono || '-'}</td>
                    <td>{emp.cargo}</td>
                    <td>{emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Empleados;
