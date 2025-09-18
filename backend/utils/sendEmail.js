// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Crear el transportador de correo de forma dinámica desde el .env
  // Este código ahora funcionará con cualquier servicio SMTP.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // `secure: true` solo para el puerto 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Definir las opciones del correo (esto no cambia)
  const mailOptions = {
    from: `Elegancia Urban <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 3. Enviar el correo
  await transporter.sendMail(mailOptions);
  console.log('Correo de verificación enviado exitosamente a:', options.to);
};

module.exports = sendEmail;