'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import './Login.css';

const bgImage = '/images/login-bg.png';
const API_URL = '/api';

export default function LoginPage() {
    const router = useRouter();
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth?action=usuarios`);
            const data = response?.data;
            if (Array.isArray(data)) {
                setUsuarios(data);
            } else {
                setUsuarios([]);
                setError('No se pudo cargar la lista de usuarios. Puedes escribir tu nombre para intentar acceder.');
            }
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            // Fallback: If API fails, allow manual entry by not setting users but stopping loading
            setUsuarios([]);
            const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
            setError(`Error cargando usuarios: ${errorMsg}. Puedes escribir manual.`);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedUser || loading) return;

        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth?action=login`, {
                username: selectedUser,
                password: password
            });

            const { user, token } = response.data;

            // Save session
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect
            router.replace('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Error de autenticación. Revisa tus credenciales.');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-background" style={{ backgroundImage: `url(${bgImage})` }}></div>

            <div className="login-container fade-in">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <h1>Control de Horarios</h1>
                        <p className="subtitle">Gestión de Tiempo Profesional</p>
                    </div>

                    {error && (
                        <div className="login-error slide-in">
                            <span className="error-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </span>
                            {error}
                        </div>
                    )}

                    {loadingUsers ? (
                        <div className="loading-users">
                            <div className="spinner"></div>
                            <p>Sincronizando equipo...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="user-select">Identifícate</label>
                                {usuarios.length > 0 ? (
                                    <div className="select-wrapper">
                                        <select
                                            id="user-select"
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                            required
                                            className={selectedUser ? 'has-value' : ''}
                                        >
                                            <option value="" disabled>-- Selecciona tu nombre --</option>
                                            {usuarios.map((user) => (
                                                <option key={user.username} value={user.username}>
                                                    {user.nombre} {user.apellido}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="user-role-badge">
                                            {usuarios.find(u => u.username === selectedUser)?.rol || 'Usuario'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="input-wrapper">
                                        <input
                                            id="user-input"
                                            type="text"
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                            required
                                            placeholder="Escribe tu usuario (ej. Juan)"
                                            className="manual-user-input"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Tu Clave Acceso</label>
                                <div className="input-wrapper">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="login-actions">
                                <button
                                    type="submit"
                                    className={`login-button ${loading ? 'loading' : ''}`}
                                    disabled={loading || !selectedUser}
                                >
                                    <span className="button-text">
                                        {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
                                    </span>
                                    {!loading && (
                                        <span className="button-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="login-footer">
                                <p>© 2026 Sistema Horario • Seguridad Supabase</p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
