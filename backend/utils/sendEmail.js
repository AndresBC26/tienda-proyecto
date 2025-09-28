// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Crear un "transporter" (el servicio que enviará el email)
  // Usaremos Gmail como ejemplo. Para producción, considera servicios como SendGrid.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true para puerto 465, false para otros
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Definir las opciones del email
  const mailOptions = {
    from: `"Elegancia Urban" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 3. Enviar el email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;