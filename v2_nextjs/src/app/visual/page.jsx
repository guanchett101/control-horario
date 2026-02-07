'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function VisualizacionPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    
    // Estados para personalización
    const [config, setConfig] = useState({
        // Colores
        colorPrimario: '#1e3c72',
        colorSecundario: '#2a5298',
        colorExito: '#10b981',
        colorPeligro: '#ef4444',
        colorAdvertencia: '#f59e0b',
        colorInfo: '#3b82f6',
        
        // Tipografía
        fuentePrincipal: 'Inter',
        tamanoFuente: '16',
        
        // Espaciado
        borderRadius: '4',
        espaciado: 'normal',
        
        // Tema
        tema: 'claro',
        
        // Efectos
        sombras: 'sutiles',
        animaciones: 'activadas'
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
        
        // Cargar configuración guardada
        const savedConfig = localStorage.getItem('visualConfig');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, [user]);

    const handleChange = (campo, valor) => {
        setConfig(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const guardarConfiguracion = () => {
        localStorage.setItem('visualConfig', JSON.stringify(config));
        alert('✅ Configuración guardada correctamente\n\n⚠️ Nota: Para aplicar los cambios completamente, recarga la página.');
    };

    const restaurarDefecto = () => {
        if (window.confirm('¿Restaurar configuración por defecto?')) {
            const defaultConfig = {
                colorPrimario: '#1e3c72',
                colorSecundario: '#2a5298',
                colorExito: '#10b981',
                colorPeligro: '#ef4444',
                colorAdvertencia: '#f59e0b',
                colorInfo: '#3b82f6',
                fuentePrincipal: 'Inter',
                tamanoFuente: '16',
                borderRadius: '4',
                espaciado: 'normal',
                tema: 'claro',
                sombras: 'sutiles',
                animaciones: 'activadas'
            };
            setConfig(defaultConfig);
            localStorage.setItem('visualConfig', JSON.stringify(defaultConfig));
            alert('✅ Configuración restaurada');
        }
    };

    const exportarConfiguracion = () => {
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'configuracion-visual.json';
        link.click();
    };

    if (!user) return null;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar user={user} />

            <div className="container" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: isMobile ? '1rem' : '2rem'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h2 style={{
                        color: '#111827',
                        fontSize: isMobile ? '1.5rem' : '1.8rem',
                        margin: 0,
                        borderLeft: '5px solid #8b5cf6',
                        paddingLeft: '1rem'
                    }}>
                        🎨 Personalización Visual
                    </h2>
                </div>

                {/* Botones de Acción */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={guardarConfiguracion}
                        className="btn btn-success"
                        style={{ flex: isMobile ? '1' : 'initial' }}
                    >
                        💾 Guardar Cambios
                    </button>
                    <button
                        onClick={restaurarDefecto}
                        className="btn"
                        style={{
                            background: '#6b7280',
                            color: 'white',
                            flex: isMobile ? '1' : 'initial'
                        }}
                    >
                        🔄 Restaurar Defecto
                    </button>
                    <button
                        onClick={exportarConfiguracion}
                        className="btn btn-primary"
                        style={{ flex: isMobile ? '1' : 'initial' }}
                    >
                        📥 Exportar Config
                    </button>
                </div>

                {/* Sección: Colores */}
                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🎨 Paleta de Colores
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Color Primario
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={config.colorPrimario}
                                    onChange={(e) => handleChange('colorPrimario', e.target.value)}
                                    style={{
                                        width: '60px',
                                        height: '40px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={config.colorPrimario}
                                    onChange={(e) => handleChange('colorPrimario', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Color Éxito
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={config.colorExito}
                                    onChange={(e) => handleChange('colorExito', e.target.value)}
                                    style={{
                                        width: '60px',
                                        height: '40px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={config.colorExito}
                                    onChange={(e) => handleChange('colorExito', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Color Peligro
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={config.colorPeligro}
                                    onChange={(e) => handleChange('colorPeligro', e.target.value)}
                                    style={{
                                        width: '60px',
                                        height: '40px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={config.colorPeligro}
                                    onChange={(e) => handleChange('colorPeligro', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Color Advertencia
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={config.colorAdvertencia}
                                    onChange={(e) => handleChange('colorAdvertencia', e.target.value)}
                                    style={{
                                        width: '60px',
                                        height: '40px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={config.colorAdvertencia}
                                    onChange={(e) => handleChange('colorAdvertencia', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Color Info
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={config.colorInfo}
                                    onChange={(e) => handleChange('colorInfo', e.target.value)}
                                    style={{
                                        width: '60px',
                                        height: '40px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={config.colorInfo}
                                    onChange={(e) => handleChange('colorInfo', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección: Tipografía */}
                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📝 Tipografía
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Fuente Principal
                            </label>
                            <select
                                value={config.fuentePrincipal}
                                onChange={(e) => handleChange('fuentePrincipal', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="Inter">Inter (Defecto)</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Open Sans">Open Sans</option>
                                <option value="Lato">Lato</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="Poppins">Poppins</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Tamaño Base: {config.tamanoFuente}px
                            </label>
                            <input
                                type="range"
                                min="14"
                                max="20"
                                value={config.tamanoFuente}
                                onChange={(e) => handleChange('tamanoFuente', e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                <span>14px</span>
                                <span>20px</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección: Diseño */}
                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📐 Diseño y Espaciado
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Border Radius: {config.borderRadius}px
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={config.borderRadius}
                                onChange={(e) => handleChange('borderRadius', e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                <span>0px (Cuadrado)</span>
                                <span>20px (Redondeado)</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Espaciado
                            </label>
                            <select
                                value={config.espaciado}
                                onChange={(e) => handleChange('espaciado', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="compacto">Compacto</option>
                                <option value="normal">Normal (Defecto)</option>
                                <option value="amplio">Amplio</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección: Efectos Visuales */}
                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ✨ Efectos Visuales
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Tema
                            </label>
                            <select
                                value={config.tema}
                                onChange={(e) => handleChange('tema', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="claro">Claro (Defecto)</option>
                                <option value="oscuro">Oscuro</option>
                                <option value="auto">Automático</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Sombras
                            </label>
                            <select
                                value={config.sombras}
                                onChange={(e) => handleChange('sombras', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="ninguna">Sin sombras</option>
                                <option value="sutiles">Sutiles (Defecto)</option>
                                <option value="pronunciadas">Pronunciadas</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                Animaciones
                            </label>
                            <select
                                value={config.animaciones}
                                onChange={(e) => handleChange('animaciones', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="activadas">Activadas (Defecto)</option>
                                <option value="reducidas">Reducidas</option>
                                <option value="desactivadas">Desactivadas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vista Previa */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        👁️ Vista Previa
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: '1rem'
                    }}>
                        <div style={{
                            padding: '1rem',
                            background: config.colorPrimario,
                            color: 'white',
                            borderRadius: `${config.borderRadius}px`,
                            textAlign: 'center',
                            fontWeight: '600',
                            boxShadow: config.sombras === 'pronunciadas' ? '0 10px 15px rgba(0,0,0,0.2)' : config.sombras === 'sutiles' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                        }}>
                            Botón Primario
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: config.colorExito,
                            color: 'white',
                            borderRadius: `${config.borderRadius}px`,
                            textAlign: 'center',
                            fontWeight: '600',
                            boxShadow: config.sombras === 'pronunciadas' ? '0 10px 15px rgba(0,0,0,0.2)' : config.sombras === 'sutiles' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                        }}>
                            Botón Éxito
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: config.colorPeligro,
                            color: 'white',
                            borderRadius: `${config.borderRadius}px`,
                            textAlign: 'center',
                            fontWeight: '600',
                            boxShadow: config.sombras === 'pronunciadas' ? '0 10px 15px rgba(0,0,0,0.2)' : config.sombras === 'sutiles' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                        }}>
                            Botón Peligro
                        </div>
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1.5rem',
                        background: '#f9fafb',
                        borderRadius: `${config.borderRadius}px`,
                        border: '1px solid #e5e7eb'
                    }}>
                        <p style={{ fontSize: `${config.tamanoFuente}px`, fontFamily: config.fuentePrincipal, margin: 0 }}>
                            Este es un ejemplo de texto con la fuente <strong>{config.fuentePrincipal}</strong> y tamaño <strong>{config.tamanoFuente}px</strong>.
                        </p>
                    </div>
                </div>

                {/* Nota Informativa */}
                <div style={{
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    padding: '1.5rem',
                    marginTop: '2rem'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                        <div style={{ fontSize: '1.5rem' }}>ℹ️</div>
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '1rem' }}>
                                Nota sobre la Personalización
                            </h4>
                            <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Los cambios visuales se guardan en tu navegador. Para aplicar estos estilos globalmente en toda la aplicación, 
                                se requeriría modificar el archivo de estilos CSS principal. Esta funcionalidad está diseñada para previsualizar 
                                y planificar cambios visuales antes de implementarlos en producción.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
