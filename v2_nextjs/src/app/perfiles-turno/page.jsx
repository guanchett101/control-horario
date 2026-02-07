'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const API_URL = '/api';

export default function PerfilesTurnoPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [isMobile, setIsMobile] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'continuo',
        horaEntrada: '09:00',
        horaSalida: '18:00',
        pausaInicio: '',
        pausaFin: '',
        horaEntradaTarde: '',
        horaSalidaTarde: ''
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
        cargarPerfiles();
    }, [user]);

    const cargarPerfiles = async () => {
        try {
            const response = await axios.get(`${API_URL}/perfiles-turno`);
            setPerfiles(response.data);
        } catch (error) {
            console.error('Error al cargar perfiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editando) {
                await axios.put(`${API_URL}/perfiles-turno/${editando}`, {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    tipo: formData.tipo,
                    hora_entrada: formData.horaEntrada,
                    hora_salida: formData.horaSalida,
                    pausa_inicio: formData.pausaInicio || null,
                    pausa_fin: formData.pausaFin || null,
                    hora_entrada_tarde: formData.horaEntradaTarde || null,
                    hora_salida_tarde: formData.horaSalidaTarde || null
                });
                alert('✅ Perfil actualizado exitosamente');
            } else {
                await axios.post(`${API_URL}/perfiles-turno`, {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    tipo: formData.tipo,
                    hora_entrada: formData.horaEntrada,
                    hora_salida: formData.horaSalida,
                    pausa_inicio: formData.pausaInicio || null,
                    pausa_fin: formData.pausaFin || null,
                    hora_entrada_tarde: formData.horaEntradaTarde || null,
                    hora_salida_tarde: formData.horaSalidaTarde || null
                });
                alert('✅ Perfil creado exitosamente');
            }

            cancelar();
            cargarPerfiles();
        } catch (error) {
            alert('❌ Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Limpiar campos según tipo
        if (name === 'tipo') {
            if (value === 'continuo') {
                setFormData(prev => ({
                    ...prev,
                    tipo: value,
                    horaEntradaTarde: '',
                    horaSalidaTarde: ''
                }));
            } else if (value === 'partido') {
                setFormData(prev => ({
                    ...prev,
                    tipo: value,
                    pausaInicio: '',
                    pausaFin: ''
                }));
            }
        }
    };

    const editarPerfil = (perfil) => {
        setEditando(perfil.id);
        setFormData({
            nombre: perfil.nombre,
            descripcion: perfil.descripcion || '',
            tipo: perfil.tipo,
            horaEntrada: perfil.hora_entrada,
            horaSalida: perfil.hora_salida,
            pausaInicio: perfil.pausa_inicio || '',
            pausaFin: perfil.pausa_fin || '',
            horaEntradaTarde: perfil.hora_entrada_tarde || '',
            horaSalidaTarde: perfil.hora_salida_tarde || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => {
        setShowForm(false);
        setEditando(null);
        setFormData({
            nombre: '',
            descripcion: '',
            tipo: 'continuo',
            horaEntrada: '09:00',
            horaSalida: '18:00',
            pausaInicio: '',
            pausaFin: '',
            horaEntradaTarde: '',
            horaSalidaTarde: ''
        });
    };

    const eliminarPerfil = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de eliminar el perfil "${nombre}"?\n\n⚠️ Los empleados asignados a este perfil quedarán sin perfil.`)) {
            try {
                await axios.delete(`${API_URL}/perfiles-turno/${id}`);
                alert('✅ Perfil eliminado');
                cargarPerfiles();
            } catch (error) {
                alert('❌ Error al eliminar: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const calcularHorasEfectivas = (perfil) => {
        const entrada = perfil.hora_entrada.split(':');
        const salida = perfil.hora_salida.split(':');
        
        let minutosTotal = (parseInt(salida[0]) * 60 + parseInt(salida[1])) - 
                          (parseInt(entrada[0]) * 60 + parseInt(entrada[1]));

        if (perfil.tipo === 'continuo' && perfil.pausa_inicio && perfil.pausa_fin) {
            const pausaIni = perfil.pausa_inicio.split(':');
            const pausaFin = perfil.pausa_fin.split(':');
            const minutosPausa = (parseInt(pausaFin[0]) * 60 + parseInt(pausaFin[1])) - 
                                (parseInt(pausaIni[0]) * 60 + parseInt(pausaIni[1]));
            minutosTotal -= minutosPausa;
        }

        if (perfil.tipo === 'partido' && perfil.hora_entrada_tarde && perfil.hora_salida_tarde) {
            const entradaTarde = perfil.hora_entrada_tarde.split(':');
            const salidaTarde = perfil.hora_salida_tarde.split(':');
            minutosTotal += (parseInt(salidaTarde[0]) * 60 + parseInt(salidaTarde[1])) - 
                           (parseInt(entradaTarde[0]) * 60 + parseInt(entradaTarde[1]));
        }

        const horas = Math.floor(minutosTotal / 60);
        const minutos = minutosTotal % 60;
        return `${horas}h ${minutos > 0 ? minutos + 'min' : ''}`;
    };

    if (!user) return null;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar user={user} />

            <div className="container" style={{
                maxWidth: isMobile ? '100%' : '1200px',
                padding: isMobile ? '0.75rem' : '0 1rem',
                margin: '0 auto'
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
                        ⏰ {isMobile ? 'Perfiles de Turno' : 'Gestión de Perfiles de Turno'}
                    </h2>
                    <button
                        onClick={() => showForm ? cancelar() : setShowForm(true)}
                        className="btn btn-primary"
                        style={{
                            fontSize: isMobile ? '0.85rem' : '1rem',
                            padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.2rem',
                            background: '#10b981'
                        }}
                    >
                        {showForm ? 'Cancelar' : isMobile ? '+ Nuevo' : '+ Nuevo Perfil'}
                    </button>
                </div>

                {showForm && (
                    <div className="card" style={{
                        padding: isMobile ? '1rem' : '2rem',
                        marginBottom: isMobile ? '1rem' : '2rem',
                        border: '2px solid #10b981'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: '600', color: '#10b981' }}>
                            {editando ? '✏️ Editar Perfil' : '➕ Nuevo Perfil de Turno'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre del Perfil *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Oficina Estándar"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Descripción opcional del perfil"
                                    rows="2"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo de Jornada *</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="continuo">Continuo (con o sin pausa)</option>
                                    <option value="partido">Partido (2 turnos)</option>
                                </select>
                            </div>

                            <h4 style={{ margin: '1.5rem 0 0.5rem', color: '#374151', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>
                                ⏰ Horario Principal
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Hora Entrada *</label>
                                    <input
                                        type="time"
                                        name="horaEntrada"
                                        value={formData.horaEntrada}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora Salida *</label>
                                    <input
                                        type="time"
                                        name="horaSalida"
                                        value={formData.horaSalida}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {formData.tipo === 'continuo' && (
                                <>
                                    <h4 style={{ margin: '1.5rem 0 0.5rem', color: '#374151', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>
                                        🍽️ Pausa para Comer (Opcional)
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Inicio Pausa</label>
                                            <input
                                                type="time"
                                                name="pausaInicio"
                                                value={formData.pausaInicio}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Fin Pausa</label>
                                            <input
                                                type="time"
                                                name="pausaFin"
                                                value={formData.pausaFin}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.tipo === 'partido' && (
                                <>
                                    <h4 style={{ margin: '1.5rem 0 0.5rem', color: '#374151', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>
                                        🌆 Turno Tarde
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Hora Entrada Tarde *</label>
                                            <input
                                                type="time"
                                                name="horaEntradaTarde"
                                                value={formData.horaEntradaTarde}
                                                onChange={handleChange}
                                                required={formData.tipo === 'partido'}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hora Salida Tarde *</label>
                                            <input
                                                type="time"
                                                name="horaSalidaTarde"
                                                value={formData.horaSalidaTarde}
                                                onChange={handleChange}
                                                required={formData.tipo === 'partido'}
                                            />
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
                    border: '2px solid #3b82f6'
                }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: '600', color: '#3b82f6' }}>
                        Perfiles Disponibles ({perfiles.length})
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
                            Cargando perfiles...
                        </div>
                    ) : perfiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.6 }}>⏰</div>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#374151' }}>No hay perfiles de turno</p>
                            <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.5rem' }}>Haz clic en "+ Nuevo Perfil" para comenzar</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                            {perfiles.map((perfil) => (
                                <div key={perfil.id} style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '1.25rem',
                                    background: 'white',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '600' }}>
                                            {perfil.nombre}
                                        </h4>
                                        <span style={{
                                            background: perfil.tipo === 'continuo' ? '#dbeafe' : '#fef3c7',
                                            color: perfil.tipo === 'continuo' ? '#1e40af' : '#92400e',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {perfil.tipo}
                                        </span>
                                    </div>

                                    {perfil.descripcion && (
                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', lineHeight: 1.4 }}>
                                            {perfil.descripcion}
                                        </p>
                                    )}

                                    <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>
                                            <strong>🌅 Turno Principal:</strong> {perfil.hora_entrada} - {perfil.hora_salida}
                                        </div>
                                        {perfil.pausa_inicio && perfil.pausa_fin && (
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                <strong>🍽️ Pausa:</strong> {perfil.pausa_inicio} - {perfil.pausa_fin}
                                            </div>
                                        )}
                                        {perfil.hora_entrada_tarde && perfil.hora_salida_tarde && (
                                            <div style={{ fontSize: '0.85rem', color: '#374151', marginTop: '0.5rem' }}>
                                                <strong>🌆 Turno Tarde:</strong> {perfil.hora_entrada_tarde} - {perfil.hora_salida_tarde}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ 
                                        background: '#ecfdf5', 
                                        border: '1px solid #10b981',
                                        padding: '0.5rem', 
                                        borderRadius: '4px', 
                                        marginBottom: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#047857' }}>
                                            ⏱️ Horas Efectivas: {calcularHorasEfectivas(perfil)}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => editarPerfil(perfil)}
                                            style={{
                                                flex: 1,
                                                background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={() => eliminarPerfil(perfil.id, perfil.nombre)}
                                            style={{
                                                flex: 1,
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
