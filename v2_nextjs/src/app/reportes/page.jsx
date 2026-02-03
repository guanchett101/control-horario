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
                if (parsedUser.rol !== 'admin') {
                    router.push('/'); // Protect Access
                }
            } catch (e) {
                router.push('/login');
            }
        }
    }, [router]);

    useEffect(() => {
        if (!user) return;

        cargarEmpleados();
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);

        setFechaFin(hoy.toISOString().split('T')[0]);
        setFechaInicio(haceUnMes.toISOString().split('T')[0]);
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
            const nombre = `${reg.empleados.nombre} ${reg.empleados.apellido}`;
            const cargo = reg.empleados.cargo;
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
        // (Similar to CSV but HTML logic, keeping simplified for brevity or can implement fully if user needs)
        // For now reusing the logic from the React component is fine.
        if (registros.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const empleado = empleados.find(e => e.id === parseInt(empleadoId));
        const nombreEmpleado = empleado ? `${empleado.nombre}_${empleado.apellido}` : 'empleado';

        // Crear HTML para Excel
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
            const nombre = `${reg.empleados.nombre} ${reg.empleados.apellido}`;
            const cargo = reg.empleados.cargo;
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

        // Descargar archivo
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
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar user={user} />

            <div className="container">
                <h2 style={{ marginBottom: '2rem', color: '#111827' }}>📊 Reportes de Horarios</h2>

                <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>Filtros de Búsqueda</h3>
                    <form onSubmit={buscarRegistros}>
                        <div className="form-group">
                            <label>Seleccionar Empleado</label>
                            {loadingEmpleados ? (
                                <p style={{ color: '#6b7280' }}>Cargando empleados...</p>
                            ) : (
                                <select
                                    value={empleadoId}
                                    onChange={(e) => setEmpleadoId(e.target.value)}
                                    required
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label>Fecha Inicio</label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Fecha Fin</label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '🔍 Buscando...' : '🔍 Buscar Registros'}
                        </button>
                    </form>
                </div>

                {registros.length > 0 && totales && (
                    <>
                        {/* Resumen */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Días Trabajados</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '600' }}>{totales.diasTrabajados}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Horas</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '600' }}>{totales.totalHoras}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Promedio Diario</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '600' }}>{totales.promedioHoras}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Días Incompletos</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '600', color: totales.diasIncompletos > 0 ? '#ef4444' : '#111827' }}>{totales.diasIncompletos}</div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Exportar Reporte</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button onClick={exportarExcel} className="btn btn-success">📊 Exportar a Excel</button>
                                <button onClick={exportarCSV} className="btn btn-primary">📄 Exportar a CSV</button>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="card" style={{ padding: '1.75rem' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.125rem' }}>Detalle de Registros ({registros.length})</h3>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Empleado</th>
                                            <th>Cargo</th>
                                            <th>Entrada</th>
                                            <th>Salida</th>
                                            <th>Horas</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registros.map((reg) => (
                                            <tr key={reg.id}>
                                                <td>{new Date(reg.fecha).toLocaleDateString('es-ES')}</td>
                                                <td>{reg.empleados.nombre} {reg.empleados.apellido}</td>
                                                <td>{reg.empleados.cargo}</td>
                                                <td style={{ fontFamily: 'monospace' }}>{reg.hora_entrada || '-'}</td>
                                                <td style={{ fontFamily: 'monospace' }}>{reg.hora_salida || '-'}</td>
                                                <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{calcularHoras(reg.hora_entrada, reg.hora_salida).texto}</td>
                                                <td>
                                                    {!reg.hora_salida ? (
                                                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Incompleto</span>
                                                    ) : (
                                                        <span style={{ background: '#d1fae5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Completo</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {!loading && registros.length === 0 && empleadoId && (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <p style={{ color: '#6b7280', margin: 0 }}>No se encontraron registros para el período seleccionado</p>
                    </div>
                )}

            </div>
        </div>
    );
}
