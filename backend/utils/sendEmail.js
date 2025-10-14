// utils/sendEmail.js
const sgMail = require('@sendgrid/mail');

// Se configura la API key al inicio
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  // 1. Definir el mensaje
  const msg = {
    to: options.to,
    // Usamos el correo verificado en SendGrid como remitente
    from: {
        name: 'Elegancia Urban',
        email: process.env.SENDGRID_FROM_EMAIL
    },
    subject: options.subject,
    html: options.html,
  };

  try {
    // 2. Enviar el correo usando la API de SendGrid
    await sgMail.send(msg);
    console.log(`✅ Correo enviado a ${options.to} a través de SendGrid.`);
  } catch (error) {
    console.error('❌ Error al enviar correo con SendGrid:', error);
    
    if (error.response) {
      console.error(error.response.body)
    }
    // Lanzamos el error para que sea capturado por el bloque catch en user.routes.js
    throw error;
  }
};

module.exports = sendEmail;