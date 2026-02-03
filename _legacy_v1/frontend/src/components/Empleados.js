import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Empleados({ user, onLogout }) {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
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
    // Detectar móvil
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const response = await axios.get(`${API_URL}/empleados?action=list`);
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
        await axios.put(`${API_URL}/empleados?action=detail&id=${editando}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          cargo: formData.cargo
        });
        alert('✅ Empleado actualizado exitosamente');
      } else {
        // Crear nuevo empleado
        const empleadoResponse = await axios.post(`${API_URL}/empleados?action=create`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          cargo: formData.cargo,
          fechaIngreso: formData.fechaIngreso
        });

        // Crear usuario con contraseña por defecto "123456"
        await axios.post(`${API_URL}/auth?action=register`, {
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
        await axios.delete(`${API_URL}/empleados?action=detail&id=${id}`);
        alert('✅ Empleado eliminado');
        cargarEmpleados();
      } catch (error) {
        alert('❌ Error al eliminar: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar user={user} onLogout={onLogout} />

      <div className="container" style={{
        maxWidth: isMobile ? '100%' : '1200px',
        padding: isMobile ? '0.75rem' : '0 1rem',
        margin: '0 auto',
        overflowX: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '1rem' : '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ color: '#111827', fontSize: isMobile ? '1.25rem' : '1.5rem', margin: 0 }}>
            👥 {isMobile ? 'Empleados' : 'Gestión de Empleados'}
          </h2>
          <button
            onClick={() => showForm ? cancelar() : setShowForm(true)}
            className="btn btn-primary"
            style={{
              fontSize: isMobile ? '0.85rem' : '1rem',
              padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.2rem',
              background: '#10b981',  // VERDE para ver cambio
              whiteSpace: 'nowrap'
            }}
          >
            {showForm ? 'Cancelar' : isMobile ? '+ Nuevo' : '+ Nuevo Empleado'}
          </button>
        </div>

        {showForm && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: isMobile ? '1rem' : '2rem',
            marginBottom: isMobile ? '1rem' : '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '2px solid #10b981',  // BORDE VERDE para ver cambio
            maxWidth: '100%',
            overflowX: 'hidden'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: '600', color: '#10b981' }}>
              {editando ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', width: '100%' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', width: '100%' }}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', width: '100%' }}>
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
                <button type="submit" className="btn btn-success" style={{ width: isMobile ? '100%' : 'auto' }}>
                  {editando ? '💾 Guardar' : '✅ Crear'}
                </button>
                <button type="button" onClick={cancelar} className="btn" style={{ background: '#6b7280', width: isMobile ? '100%' : 'auto' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: isMobile ? '1rem' : '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '2px solid #ef4444',  // BORDE ROJO para ver cambio
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: '600', color: '#ef4444' }}>
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
          ) : isMobile ? (
            // Vista de tarjetas para móvil
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '100%' }}>
              {empleados.map((emp) => (
                <div key={emp.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: '#fef3c7',  // FONDO AMARILLO para ver cambio
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflowWrap: 'break-word'
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem', color: '#111827', marginBottom: '0.25rem', wordBreak: 'break-word' }}>
                      {emp.nombre} {emp.apellido}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', wordBreak: 'break-word' }}>
                      {emp.cargo}
                    </div>
                  </div>

                  {(emp.email || emp.telefono) && (
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
                      {emp.email && <div>📧 {emp.email}</div>}
                      {emp.telefono && <div>📱 {emp.telefono}</div>}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', width: '100%' }}>
                    <button
                      onClick={() => editarEmpleado(emp)}
                      style={{
                        flex: 1,
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        minWidth: 0
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => eliminarEmpleado(emp.id, `${emp.nombre} ${emp.apellido}`)}
                      style={{
                        flex: 1,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        minWidth: 0
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista de tabla para escritorio
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
