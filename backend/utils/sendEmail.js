const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Crear el transporter con la configuración mejorada
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // Se asegura de que 'secure' sea true solo si el puerto es 465
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // ✅ MEJORA AÑADIDA: Opción de compatibilidad TLS
    // Esto soluciona problemas comunes de certificados en entornos locales.
    tls: {
        rejectUnauthorized: false
    }
  });

  // 2. Definir las opciones del correo (sin cambios)
  const mailOptions = {
    from: `"Elegancia Urban" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 3. Enviar el correo
  await transporter.sendMail(mailOptions);
  console.log('Correo de verificación enviado exitosamente a:', options.to);
};

module.exports = sendEmail;