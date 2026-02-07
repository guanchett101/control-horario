// Módulo de envío de emails (placeholder)
// En producción, configurar con un servicio real como SendGrid, Resend, etc.

export async function enviarAviso(empleado, tipo, detalles) {
    // Por ahora solo logueamos
    console.log('📧 Aviso de email:', {
        empleado: `${empleado.nombre} ${empleado.apellido}`,
        email: empleado.email,
        tipo,
        detalles
    });

    // TODO: Implementar envío real de emails
    // Ejemplo con SendGrid, Resend, Nodemailer, etc.
    
    return {
        success: true,
        message: 'Email enviado (simulado)'
    };
}

export async function enviarAvisoFichajePendiente(empleado, fecha) {
    return enviarAviso(empleado, 'fichaje_pendiente', {
        fecha,
        mensaje: 'Tienes un fichaje pendiente de completar'
    });
}

export async function enviarAvisoRetraso(empleado, minutos) {
    return enviarAviso(empleado, 'retraso', {
        minutos,
        mensaje: `Llegaste ${minutos} minutos tarde`
    });
}
