'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const API_URL = '/api';

export default function ReportesPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [empleadoId, setEmpleadoId] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmpleados, setLoadingEmpleados] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Auth Check
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            router.push('/login');
        } else {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                if (parsedUser.rol?.toLowerCase() !== 'admin') {
                    router.push('/'); // Protect Access
                }
            } catch (e) {
                router.push('/login');
            }
        }
    }, [router]);

    useEffect(() => {
        if (!user) return;

        // Use 1024px as breakpoint for "Mobile/Tablet" view to avoid huge table on medium screens
        const checkMobile = () => {
            const isSmall = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
            setIsMobile(isSmall);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        cargarEmpleados();
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);

        setFechaFin(hoy.toISOString().split('T')[0]);
        setFechaInicio(haceUnMes.toISOString().split('T')[0]);

        return () => window.removeEventListener('resize', checkMobile);
    }, [user]);

    const cargarEmpleados = async () => {
        try {
            const response = await axios.get(`${API_URL}/empleados`);
            setEmpleados(response.data);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
        } finally {
            setLoadingEmpleados(false);
        }
    };

    const buscarRegistros = async (e) => {
        e.preventDefault();
        if (!empleadoId) {
            alert('Por favor selecciona un empleado');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/registros?action=empleado&id=${empleadoId}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRegistros(response.data);
        } catch (error) {
            alert('Error al buscar registros: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const calcularHoras = (entrada, salida) => {
        if (!entrada || !salida) return { texto: '-', minutos: 0 };
        const [hE, mE] = entrada.split(':').map(Number);
        const [hS, mS] = salida.split(':').map(Number);
        const minutos = (hS * 60 + mS) - (hE * 60 + mE);
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return { texto: `${horas}h ${mins}m`, minutos };
    };

    const calcularTotales = () => {
        let totalMinutos = 0;
        let diasTrabajados = 0;
        let diasIncompletos = 0;

        registros.forEach(reg => {
            if (reg.hora_entrada) {
                diasTrabajados++;
                if (reg.hora_salida) {
                    const { minutos } = calcularHoras(reg.hora_entrada, reg.hora_salida);
                    totalMinutos += minutos;
                } else {
                    diasIncompletos++;
                }
            }
        });

        const totalHoras = Math.floor(totalMinutos / 60);
        const totalMins = totalMinutos % 60;

        return {
            totalHoras: `${totalHoras}h ${totalMins}m`,
            diasTrabajados,
            diasIncompletos,
            promedioHoras: diasTrabajados > 0 ? `${Math.floor(totalMinutos / diasTrabajados / 60)}h ${Math.floor((totalMinutos / diasTrabajados) % 60)}m` : '-'
        };
    };

    const exportarCSV = () => {
        if (registros.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const empleado = empleados.find(e => e.id === parseInt(empleadoId));
        const nombreEmpleado = empleado ? `${empleado.nombre}_${empleado.apellido}` : 'empleado';

        let csv = 'Fecha,Empleado,Cargo,Entrada,Salida,Horas Trabajadas\n';

        registros.forEach(reg => {
            const fecha = new Date(reg.fecha).toLocaleDateString('es-ES');
            const nombre = `${reg.empleados?.nombre} ${reg.empleados?.apellido}`;
            const cargo = reg.empleados?.cargo;
            const entrada = reg.hora_entrada || '-';
            const salida = reg.hora_salida || '-';
            const horas = calcularHoras(reg.hora_entrada, reg.hora_salida).texto;

            csv += `${fecha},"${nombre}","${cargo}",${entrada},${salida},${horas}\n`;
        });

        const totales = calcularTotales();
        csv += `\nResumen:,,,,,\n`;
        csv += `Días trabajados:,${totales.diasTrabajados},,,,\n`;
        csv += `Días incompletos:,${totales.diasIncompletos},,,,\n`;
        csv += `Total horas:,${totales.totalHoras},,,,\n`;
        csv += `Promedio diario:,${totales.promedioHoras},,,,\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_${nombreEmpleado}_${fechaInicio}_${fechaFin}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportarExcel = () => {
        if (registros.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const empleado = empleados.find(e => e.id === parseInt(empleadoId));
        const nombreEmpleado = empleado ? `${empleado.nombre}_${empleado.apellido}` : 'empleado';

        let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1e3c72; color: white; font-weight: bold; }
            .totales { background-color: #f3f4f6; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Reporte de Horarios</h2>
          <p><strong>Empleado:</strong> ${empleado ? `${empleado.nombre} ${empleado.apellido}` : '-'}</p>
          <p><strong>Período:</strong> ${new Date(fechaInicio).toLocaleDateString('es-ES')} - ${new Date(fechaFin).toLocaleDateString('es-ES')}</p>
          <br>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Cargo</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Horas Trabajadas</th>
              </tr>
            </thead>
            <tbody>
        `;

        registros.forEach(reg => {
            const fecha = new Date(reg.fecha).toLocaleDateString('es-ES');
            const nombre = `${reg.empleados?.nombre} ${reg.empleados?.apellido}`;
            const cargo = reg.empleados?.cargo;
            const entrada = reg.hora_entrada || '-';
            const salida = reg.hora_salida || '-';
            const horas = calcularHoras(reg.hora_entrada, reg.hora_salida).texto;

            html += `
          <tr>
            <td>${fecha}</td>
            <td>${nombre}</td>
            <td>${cargo}</td>
            <td>${entrada}</td>
            <td>${salida}</td>
            <td>${horas}</td>
          </tr>
        `;
        });

        const totales = calcularTotales();
        html += `
            </tbody>
          </table>
          <br>
          <table>
            <tr class="totales">
              <td><strong>Resumen</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>Días trabajados:</td>
              <td>${totales.diasTrabajados}</td>
            </tr>
            <tr>
              <td>Días incompletos:</td>
              <td>${totales.diasIncompletos}</td>
            </tr>
            <tr>
              <td>Total horas:</td>
              <td>${totales.totalHoras}</td>
            </tr>
            <tr>
              <td>Promedio diario:</td>
              <td>${totales.promedioHoras}</td>
            </tr>
          </table>
        </body>
        </html>
      `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_${nombreEmpleado}_${fechaInicio}_${fechaFin}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!user) return null;

    const totales = registros.length > 0 ? calcularTotales() : null;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '3rem' }}>
            <Navbar user={user} />

            <div className="container" style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{
                    marginBottom: '2rem',
                    color: '#111827',
                    fontSize: isMobile ? '1.5rem' : '1.8rem',
                    borderLeft: '5px solid #3b82f6',
                    paddingLeft: '1rem'
                }}>
                    Reportes de Horarios
                </h2>

                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '600', color: '#4b5563' }}>
                        ⚙️ Filtros de Búsqueda
                    </h3>
                    <form onSubmit={buscarRegistros}>
                        <div className="form-group">
                            <label style={{ fontWeight: '500' }}>Empleado</label>
                            {loadingEmpleados ? (
                                <p style={{ color: '#6b7280' }}>Cargando...</p>
                            ) : (
                                <select
                                    value={empleadoId}
                                    onChange={(e) => setEmpleadoId(e.target.value)}
                                    required
                                    style={{ padding: '0.6rem', background: '#f9fafb' }}
                                >
                                    <option value="">-- Selecciona un empleado --</option>
                                    {empleados.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.nombre} {emp.apellido} - {emp.cargo}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: '500' }}>Desde</label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    required
                                    style={{ padding: '0.6rem', background: '#f9fafb' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: '500' }}>Hasta</label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    required
                                    style={{ padding: '0.6rem', background: '#f9fafb' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: '600' }}>
                            {loading ? '⏳ Generando reporte...' : '📊 Generar Reporte'}
                        </button>
                    </form>
                </div>

                {registros.length > 0 && totales && (
                    <>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#374151', paddingLeft: '0.5rem' }}>Resumen del Período</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'center', borderTop: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Días Trabajados</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{totales.diasTrabajados}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'center', borderTop: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Horas</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{totales.totalHoras}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'center', borderTop: '4px solid #8b5cf6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promedio/Día</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{totales.promedioHoras}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'center', borderTop: '4px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Incompletos</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: totales.diasIncompletos > 0 ? '#ef4444' : '#1f2937' }}>{totales.diasIncompletos}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button onClick={exportarExcel} className="btn btn-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: isMobile ? '1' : 'initial' }}>📊 Descargar Excel</button>
                            <button onClick={exportarCSV} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: isMobile ? '1' : 'initial' }}>📄 Descargar CSV</button>
                        </div>

                        <div className="card" style={{ padding: isMobile ? '0' : '0', overflow: 'hidden', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#374151', paddingLeft: '0.5rem' }}>Detalle de Registros ({registros.length})</h3>

                            {isMobile ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {registros.map((reg) => {
                                        const horas = calcularHoras(reg.hora_entrada, reg.hora_salida);
                                        const incompleto = !reg.hora_salida;

                                        return (
                                            <div key={reg.id} style={{
                                                background: 'white',
                                                padding: '1rem',
                                                borderRadius: '10px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                borderLeft: incompleto ? '5px solid #f59e0b' : '5px solid #10b981',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '1.05rem' }}>
                                                        {new Date(reg.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '20px', color: '#6b7280' }}>
                                                        {new Date(reg.fecha).getFullYear()}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    <div style={{ background: '#f9fafb', padding: '0.5rem', borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '600' }}>ENTRADA</div>
                                                        <div style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: '600', color: '#1f2937' }}>{reg.hora_entrada || '--:--'}</div>
                                                    </div>
                                                    <div style={{ background: '#f9fafb', padding: '0.5rem', borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '600' }}>SALIDA</div>
                                                        <div style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: '600', color: '#1f2937' }}>{reg.hora_salida || '--:--'}</div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                        {reg.empleados?.nombre} {reg.empleados?.apellido}
                                                    </div>
                                                    <div style={{ fontWeight: '700', color: incompleto ? '#d97706' : '#059669', fontSize: '1rem' }}>
                                                        {horas.texto}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                                <tr>
                                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', minWidth: '100px' }}>Fecha</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Empleado</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Entrada</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Salida</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Horas</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ fontSize: '0.95rem' }}>
                                                {registros.map((reg, index) => (
                                                    <tr key={reg.id} style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                                                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontWeight: '500', color: '#111827' }}>
                                                            {new Date(reg.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', color: '#4b5563' }}>
                                                            <div style={{ fontWeight: '500', color: '#1f2937' }}>{reg.empleados?.nombre} {reg.empleados?.apellido}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{reg.empleados?.cargo}</div>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: '500' }}>{reg.hora_entrada || '-'}</td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: '500' }}>{reg.hora_salida || '-'}</td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                                                            {calcularHoras(reg.hora_entrada, reg.hora_salida).texto}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                            {!reg.hora_salida ? (
                                                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>Incompleto</span>
                                                            ) : (
                                                                <span style={{ background: '#d1fae5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>Completo</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {!loading && registros.length === 0 && (
                    <div className="card" style={{ padding: '4rem', textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                        <p style={{ color: '#6b7280', margin: 0 }}>
                            {empleadoId ? 'No se encontraron resultados para esta búsqueda.' : 'Selecciona un empleado y un rango de fechas para comenzar.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
