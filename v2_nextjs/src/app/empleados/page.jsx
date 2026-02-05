'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const API_URL = '/api';

export default function EmpleadosPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
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
        horarioEntrada: '09:00',
        horarioSalida: '18:00',
        horarioEntradaTarde: '',
        horarioSalidaTarde: '',
        username: '',
        password: '123456'
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            router.push('/login');
        } else {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                if (parsedUser.rol !== 'admin') {
                    router.push('/');
                }
            } catch (e) {
                router.push('/login');
            }
        }
    }, [router]);

    useEffect(() => {
        if (!user) return;
        const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(checkMobile);
        cargarEmpleados();
    }, [user]);

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

        // Validación estricta de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('⚠️ Por favor, introduce un email válido (ejemplo@empresa.com)');
            return;
        }

        try {
            if (editando) {
                // Actualizar empleado existente
                await axios.put(`${API_URL}/empleados/${editando}`, {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    email: formData.email,
                    telefono: formData.telefono,
                    cargo: formData.cargo,
                    horario_entrada: formData.horarioEntrada,
                    horario_salida: formData.horarioSalida,
                    horario_entrada_tarde: formData.horarioEntradaTarde,
                    horario_salida_tarde: formData.horarioSalidaTarde
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
                    fechaIngreso: formData.fechaIngreso,
                    horario_entrada: formData.horarioEntrada,
                    horario_salida: formData.horarioSalida,
                    horario_entrada_tarde: formData.horarioEntradaTarde,
                    horario_salida_tarde: formData.horarioSalidaTarde
                });

                // Crear usuario con contraseña personalizada
                await axios.post(`${API_URL}/auth?action=register`, {
                    empleadoId: empleadoResponse.data.id,
                    username: formData.username,
                    password: formData.password || '123456',
                    rol: 'empleado'
                });

                alert('✅ Empleado creado exitosamente\n\n📋 Credenciales:\nUsuario: ' + formData.username + '\nContraseña: ' + (formData.password || '123456') + '\n\n⚠️ El empleado debe cambiar su contraseña al entrar');
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
                horarioEntrada: '09:00',
                horarioSalida: '18:00',
                horarioEntradaTarde: '',
                horarioSalidaTarde: '',
                username: '',
                password: '123456'
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
            fechaIngreso: emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            horarioEntrada: emp.horario_entrada || '09:00',
            horarioSalida: emp.horario_salida || '18:00',
            horarioEntradaTarde: emp.horario_entrada_tarde || '',
            horarioSalidaTarde: emp.horario_salida_tarde || '',
            username: '',
            password: '123456'
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
            horarioEntrada: '09:00',
            horarioSalida: '18:00',
            horarioEntradaTarde: '',
            horarioSalidaTarde: '',
            username: '',
            password: '123456'
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

    if (!user) return null;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', overflowX: 'hidden' }}>
            <Navbar user={user} />

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
                            background: '#10b981',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {showForm ? 'Cancelar' : isMobile ? '+ Nuevo' : '+ Nuevo Empleado'}
                    </button>
                </div>

                {showForm && (
                    <div className="card" style={{
                        padding: isMobile ? '1rem' : '2rem',
                        marginBottom: isMobile ? '1rem' : '2rem',
                        border: '2px solid #10b981',
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
                                    <label>Email (Para avisos) *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="usuario@empresa.com"
                                        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                                    />
                                    <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                        Imprescindible para enviar notificaciones automáticas.
                                    </small>
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

                                <div className="form-group">
                                    <label>Fecha de Ingreso</label>
                                    <input
                                        type="date"
                                        name="fechaIngreso"
                                        value={formData.fechaIngreso}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <h4 style={{ margin: '1.5rem 0 0.5rem', color: '#374151', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>⏰ Configuración de Horario</h4>

                            {/* Turno Mañana */}
                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>Turno Mañana / Continuo</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Entrada</label>
                                        <input
                                            type="time"
                                            name="horarioEntrada"
                                            value={formData.horarioEntrada}
                                            onChange={handleChange}
                                            style={{ fontFamily: 'monospace' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Salida</label>
                                        <input
                                            type="time"
                                            name="horarioSalida"
                                            value={formData.horarioSalida}
                                            onChange={handleChange}
                                            style={{ fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Turno Tarde */}
                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>Turno Tarde (Opcional)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Entrada</label>
                                        <input
                                            type="time"
                                            name="horarioEntradaTarde"
                                            value={formData.horarioEntradaTarde}
                                            onChange={handleChange}
                                            style={{ fontFamily: 'monospace' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Salida</label>
                                        <input
                                            type="time"
                                            name="horarioSalidaTarde"
                                            value={formData.horarioSalidaTarde}
                                            onChange={handleChange}
                                            style={{ fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
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
                                    </div>

                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Contraseña Inicial *</label>
                                        <input
                                            type="text"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Por defecto: 123456"
                                            required
                                            style={{ fontFamily: 'monospace' }}
                                        />
                                        <small style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                                            Puedes dejarla como <strong>123456</strong> o establecer una personalizada.
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
                                            ⚠️ <strong>Importante:</strong> Comunica estas credenciales al empleado. Se recomienda que cambie su contraseña al ingresar.
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

                <div className="card" style={{
                    padding: isMobile ? '1rem' : '2rem',
                    border: '2px solid #ef4444',
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
                                    background: '#fef3c7',
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
                                                        className="btn"
                                                        style={{
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            padding: '0.4rem 0.8rem',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarEmpleado(emp.id, `${emp.nombre} ${emp.apellido}`)}
                                                        className="btn"
                                                        style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            padding: '0.4rem 0.8rem',
                                                            fontSize: '0.85rem'
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
