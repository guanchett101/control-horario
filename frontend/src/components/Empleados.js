import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Empleados({ user, onLogout }) {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    username: ''
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
      if (editando) {
        // Actualizar empleado existente
        await axios.put(`${API_URL}/empleados/${editando}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          cargo: formData.cargo
        });
        alert('✅ Empleado actualizado exitosamente');
      } else {
        // Crear nuevo empleado
        const empleadoResponse = await axios.post(`${API_URL}/empleados`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          cargo: formData.cargo,
          fechaIngreso: formData.fechaIngreso
        });

        // Crear usuario con contraseña por defecto "123456"
        await axios.post(`${API_URL}/auth/register`, {
          empleadoId: empleadoResponse.data.id,
          username: formData.username,
          password: '123456',
          rol: 'empleado'
        });

        alert('✅ Empleado creado exitosamente\n\n📋 Credenciales:\nUsuario: ' + formData.username + '\nContraseña: 123456\n\n⚠️ El empleado debe cambiar su contraseña al entrar');
      }

      setShowForm(false);
      setEditando(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cargo: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        username: ''
      });
      cargarEmpleados();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const editarEmpleado = (emp) => {
    setEditando(emp.id);
    setFormData({
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email || '',
      telefono: emp.telefono || '',
      cargo: emp.cargo,
      fechaIngreso: emp.fecha_ingreso || new Date().toISOString().split('T')[0],
      username: ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => {
    setShowForm(false);
    setEditando(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      cargo: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      username: ''
    });
  };

  const eliminarEmpleado = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await axios.delete(`${API_URL}/empleados/${id}`);
        alert('✅ Empleado eliminado');
        cargarEmpleados();
      } catch (error) {
        alert('❌ Error al eliminar: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#111827' }}>👥 Gestión de Empleados</h2>
          <button
            onClick={() => showForm ? cancelar() : setShowForm(true)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Empleado'}
          </button>
        </div>

        {showForm && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
              {editando ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Cargo *</label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    required
                  />
                </div>

                {!editando && (
                  <div className="form-group">
                    <label>Fecha de Ingreso *</label>
                    <input
                      type="date"
                      name="fechaIngreso"
                      value={formData.fechaIngreso}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
              </div>

              {!editando && (
                <>
                  <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                    🔐 Credenciales de Acceso
                  </h4>

                  <div className="form-group">
                    <label>Usuario (para login) *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Ej: juan.perez"
                      required
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                      La contraseña será automáticamente: <strong>123456</strong>
                    </small>
                  </div>

                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                      ⚠️ <strong>Importante:</strong> El empleado recibirá la contraseña <strong>123456</strong> y debe cambiarla al entrar por primera vez.
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-success">
                  {editando ? '💾 Guardar Cambios' : '✅ Crear Empleado'}
                </button>
                <button type="button" onClick={cancelar} className="btn" style={{ background: '#6b7280' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            Lista de Empleados ({empleados.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Cargando...
            </div>
          ) : empleados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              No hay empleados registrados
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Cargo</th>
                    <th>Fecha Ingreso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td style={{ fontWeight: '600' }}>{emp.nombre} {emp.apellido}</td>
                      <td>{emp.email || '-'}</td>
                      <td>{emp.telefono || '-'}</td>
                      <td>{emp.cargo}</td>
                      <td>{emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString('es-ES') : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => editarEmpleado(emp)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => eliminarEmpleado(emp.id, `${emp.nombre} ${emp.apellido}`)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Empleados;
