// deleteAllUsers.js
const mongoose = require('mongoose');
const User = require('./models/User'); // Asegúrate de que la ruta a tu modelo User sea correcta
require('dotenv').config();

const connectDB = async () => {
  try {
    // ===== CORRECCIÓN AQUÍ =====
    // Se usa MONGODB_URI para que coincida con tu archivo .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // ===== FIN DE LA CORRECCIÓN =====
    console.log('MongoDB conectado para la limpieza...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const deleteAllUsers = async () => {
  await connectDB();
  try {
    const result = await User.deleteMany({});
    console.log(`✅ ¡Éxito! Se han eliminado ${result.deletedCount} usuarios.`);
    console.log('Ahora puedes detener este script (Ctrl + C) y continuar con los siguientes pasos.');
  } catch (err) {
    console.error('❌ Error al eliminar los usuarios:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada.');
  }
};

// Llama a la función para ejecutar la eliminación
deleteAllUsers();