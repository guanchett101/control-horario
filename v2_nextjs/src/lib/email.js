import nodemailer from 'nodemailer';

/**
 * Envia un correo electrónico utilizando Nodemailer y Gmail.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} html - Contenido del correo en formato HTML.
 * @returns {Promise<Object>} - Resultado del envío.
 */
export async function enviarAviso(to, subject, html) {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.warn("⚠️ FALTA CONFIGURACIÓN SMTP: No se envió el correo a " + to);
        return { success: false, error: "Falta configuración SMTP" };
    }

    try {
        // Configurar el "transportador" de Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD // La contraseña de aplicación de 16 caracteres
            }
        });

        // Enviar el correo
        const info = await transporter.sendMail({
            from: `"Control Horario" <${process.env.SMTP_EMAIL}>`, // Remitente con nombre bonito
            to: to,
            subject: subject,
            html: html,
        });

        console.log(`📧 Correo enviado a ${to} (ID: ${info.messageId})`);
        return { success: true, data: info };

    } catch (error) {
        console.error(`❌ Error enviando correo a ${to}:`, error);
        return { success: false, error: error.message };
    }
}
