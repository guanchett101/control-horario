'use client';
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error capturado:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ color: '#111827', marginBottom: '1rem' }}>
                            Algo salió mal
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Hubo un problema al cargar la página. Por favor, intenta:
                        </p>
                        <div style={{ 
                            background: '#f3f4f6', 
                            padding: '1rem', 
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <div style={{ marginBottom: '0.5rem' }}>✓ Recargar la página</div>
                            <div style={{ marginBottom: '0.5rem' }}>✓ Limpiar caché del navegador</div>
                            <div>✓ Usar Firefox si el problema persiste</div>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 2rem',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            🔄 Recargar Página
                        </button>
                        {this.state.error && (
                            <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                                <summary style={{ 
                                    cursor: 'pointer', 
                                    color: '#6b7280',
                                    fontSize: '0.85rem'
                                }}>
                                    Ver detalles técnicos
                                </summary>
                                <pre style={{ 
                                    marginTop: '0.5rem',
                                    padding: '1rem',
                                    background: '#1f2937',
                                    color: '#f3f4f6',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                }}>
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
