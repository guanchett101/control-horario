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
    const [isMobile, setIsMobile] = useState(null); // null hasta detectar
    const [isReady, setIsReady] = useState(false);
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

    const toggleActivoEmpleado = async (id, nombre, estadoActual) => {
        const nuevoEstado = !estadoActual;
        const accion = nuevoEstado ? 'activar' : 'desactivar';
        
        if (window.confirm(`¿Deseas ${accion} a ${nombre}?\n\n${nuevoEstado ? '✅ El empleado recibirá notificaciones por email' : '⚠️ El empleado NO recibirá notificaciones por email'}`)) {
            try {
                await axios.patch(`${API_URL}/empleados/${id}`, {
                    activo: nuevoEstado
                });
                alert(`✅ Empleado ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
                cargarEmpleados();
            } catch (error) {
                alert('❌ Error al cambiar estado: ' + (error.response?.data?.error || error.message));
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
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                border: '4px solid #e5e7eb', 
                                borderTop: '4px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 1rem'
                            }}></div>
                            Cargando empleados...
                        </div>
                    ) : empleados.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <div style={{ 
                                fontSize: '4rem', 
                                marginBottom: '1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                opacity: 0.6
                            }}>👥</div>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#374151' }}>No hay empleados registrados</p>
                            <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.5rem' }}>Haz clic en "+ Nuevo Empleado" para comenzar</p>
                        </div>
                    ) : isMobile ? (
                        // Vista de tarjetas para móvil - MEJORADA
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '100%' }}>
                            {empleados.map((emp) => {
                                const iniciales = `${emp.nombre?.[0] || ''}${emp.apellido?.[0] || ''}`.toUpperCase();
                                const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                                const colorAvatar = colores[emp.id % colores.length];
                                
                                return (
                                    <div key={emp.id} style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        padding: '1rem',
                                        background: 'white',
                                        maxWidth: '100%',
                                        boxSizing: 'border-box',
                                        overflowWrap: 'break-word',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
                                    >
                                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                minWidth: '48px',
                                                borderRadius: '4px',
                                                background: colorAvatar,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '700',
                                                fontSize: '1.1rem',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}>
                                                {iniciales}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ 
                                                    fontWeight: '600', 
                                                    fontSize: '1rem', 
                                                    color: '#111827', 
                                                    marginBottom: '0.15rem', 
                                                    wordBreak: 'break-word',
                                                    lineHeight: 1.3
                                                }}>
                                                    {emp.nombre} {emp.apellido}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: '#6b7280', 
                                                    wordBreak: 'break-word',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem'
                                                }}>
                                                    <span style={{ fontSize: '0.7rem' }}>💼</span>
                                                    {emp.cargo}
                                                </div>
                                            </div>
                                        </div>

                                        {(emp.email || emp.telefono) && (
                                            <div style={{ 
                                                fontSize: '0.8rem', 
                                                color: '#6b7280', 
                                                marginBottom: '0.75rem', 
                                                wordBreak: 'break-all',
                                                background: '#f9fafb',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.35rem'
                                            }}>
                                                {emp.email && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.9rem' }}>📧</span>
                                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.email}</span>
                                                    </div>
                                                )}
                                                {emp.telefono && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.9rem' }}>📱</span>
                                                        <span>{emp.telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => toggleActivoEmpleado(emp.id, `${emp.nombre} ${emp.apellido}`, emp.activo)}
                                                style={{
                                                    flex: '1 1 100%',
                                                    background: emp.activo ? '#10b981' : '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.6rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    minWidth: 0,
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.35rem'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = emp.activo ? '#059669' : '#4b5563'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = emp.activo ? '#10b981' : '#6b7280'}
                                            >
                                                <span>{emp.activo ? '✅' : '⏸️'}</span> {emp.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                            <button
                                                onClick={() => editarEmpleado(emp)}
                                                style={{
                                                    flex: 1,
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.6rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    minWidth: 0,
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.35rem'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                            >
                                                <span>✏️</span> Editar
                                            </button>
                                            <button
                                                onClick={() => eliminarEmpleado(emp.id, `${emp.nombre} ${emp.apellido}`)}
                                                style={{
                                                    flex: 1,
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.6rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    minWidth: 0,
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.35rem'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                            >
                                                <span>🗑️</span> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Vista de tabla para escritorio - MEJORADA
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'separate', 
                                borderSpacing: 0,
                                fontSize: '0.9rem'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                        <th style={{ 
                                            padding: '0.75rem 1rem', 
                                            textAlign: 'left', 
                                            fontSize: '0.75rem', 
                                            textTransform: 'uppercase', 
                                            color: '#6b7280', 
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>Empleado</th>
                                        <th style={{ 
                                            padding: '0.75rem 1rem', 
                                            textAlign: 'left', 
                                            fontSize: '0.75rem', 
                                            textTransform: 'uppercase', 
                                            color: '#6b7280', 
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>Contacto</th>
                                        <th style={{ 
                                            padding: '0.75rem 1rem', 
                                            textAlign: 'left', 
                                            fontSize: '0.75rem', 
                                            textTransform: 'uppercase', 
                                            color: '#6b7280', 
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>Cargo</th>
                                        <th style={{ 
                                            padding: '0.75rem 1rem', 
                                            textAlign: 'center', 
                                            fontSize: '0.75rem', 
                                            textTransform: 'uppercase', 
                                            color: '#6b7280', 
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>Fecha Ingreso</th>
                                        <th style={{ 
                                            padding: '0.75rem 1rem', 
                                            textAlign: 'center', 
                                            fontSize: '0.75rem', 
                                            textTransform: 'uppercase', 
                                            color: '#6b7280', 
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empleados.map((emp, index) => {
                                        const iniciales = `${emp.nombre?.[0] || ''}${emp.apellido?.[0] || ''}`.toUpperCase();
                                        const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                                        const colorAvatar = colores[emp.id % colores.length];
                                        
                                        return (
                                            <tr key={emp.id} style={{ 
                                                borderBottom: '1px solid #f3f4f6',
                                                background: index % 2 === 0 ? 'white' : '#fafbfc',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc'}
                                            >
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            minWidth: '40px',
                                                            borderRadius: '4px',
                                                            background: colorAvatar,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: '700',
                                                            fontSize: '0.9rem',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}>
                                                            {iniciales}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>
                                                                {emp.nombre} {emp.apellido}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                                ID: {emp.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        {emp.email ? (
                                                            <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                <span style={{ fontSize: '0.75rem' }}>📧</span>
                                                                {emp.email}
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                                                        )}
                                                        {emp.telefono && (
                                                            <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                <span style={{ fontSize: '0.75rem' }}>📱</span>
                                                                {emp.telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.35rem',
                                                        background: '#f3f4f6',
                                                        padding: '0.35rem 0.75rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem',
                                                        color: '#374151',
                                                        fontWeight: '500'
                                                    }}>
                                                        <span style={{ fontSize: '0.75rem' }}>💼</span>
                                                        {emp.cargo}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                                                    {emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString('es-ES', { 
                                                        day: '2-digit', 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    }) : '-'}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={() => toggleActivoEmpleado(emp.id, `${emp.nombre} ${emp.apellido}`, emp.activo)}
                                                            style={{
                                                                background: emp.activo ? '#10b981' : '#6b7280',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.5rem 0.85rem',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                transition: 'all 0.2s',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.35rem'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = emp.activo ? '#059669' : '#4b5563';
                                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = emp.activo ? '#10b981' : '#6b7280';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <span>{emp.activo ? '✅' : '⏸️'}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => editarEmpleado(emp)}
                                                            style={{
                                                                background: '#3b82f6',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.5rem 0.85rem',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                transition: 'all 0.2s',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.35rem'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#2563eb';
                                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#3b82f6';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <span>✏️</span>
                                                        </button>
                                                        <button
                                                            onClick={() => eliminarEmpleado(emp.id, `${emp.nombre} ${emp.apellido}`)}
                                                            style={{
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.5rem 0.85rem',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                transition: 'all 0.2s',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.35rem'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#dc2626';
                                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#ef4444';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <span>🗑️</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
