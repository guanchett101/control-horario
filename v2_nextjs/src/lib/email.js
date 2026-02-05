import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia un correo electrónico utilizando Resend.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} html - Contenido del correo en formato HTML.
 * @returns {Promise<Object>} - Resultado del envío.
 */
export async function enviarAviso(to, subject, html) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ FALTA RESEND_API_KEY: No se envió el correo a " + to);
        return { success: false, error: "Falta API Key" };
    }

    try {
        const data = await resend.emails.send({
            from: 'Control Horario <onboarding@resend.dev>', // Usar este remitente para pruebas sin dominio configurado
            to: to,
            subject: subject,
            html: html,
        });

        console.log(`📧 Correo enviado a ${to}:`, data);
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Error enviando correo a ${to}:`, error);
        return { success: false, error: error.message };
    }
}
