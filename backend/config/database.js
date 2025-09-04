const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Conectar a MongoDB Atlas (sin opciones deprecated)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Mensajes de confirmación
    console.log(`🗄️  MongoDB Atlas conectado exitosamente!`);
    console.log(`🌍 Host: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    console.log(`🔗 Puerto: ${conn.connection.port}`);
    
    // Configurar eventos de conexión
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose conectado a MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión MongoDB Atlas:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose desconectado de MongoDB Atlas');
    });

    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('👋 Conexión MongoDB Atlas cerrada por terminación de app');
        process.exit(0);
      } catch (err) {
        console.error('Error cerrando conexión:', err);
        process.exit(1);
      }
    });

    return conn;

  } catch (error) {
    console.error('❌ ERROR CONECTANDO A MONGODB ATLAS:');
    console.error(`   • Mensaje: ${error.message}`);
    console.error(`   • Código: ${error.code || 'N/A'}`);
    
    // Mensajes de ayuda según el error
    if (error.message.includes('authentication failed')) {
      console.error('   💡 Verifica tu usuario y contraseña en MongoDB Atlas');
      console.error('   🔧 Revisa las credenciales en el archivo .env');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   💡 Verifica el string de conexión en .env');
      console.error('   🌐 Verifica que el cluster esté activo en MongoDB Atlas');
      console.error('   📡 Verifica tu conexión a Internet');
      console.error('   🔍 Revisa errores tipográficos (7l vs 71, <db_password>)');
    } else if (error.message.includes('network')) {
      console.error('   💡 Verifica tu conexión a Internet');
      console.error('   🛡️  Verifica la configuración de IP en MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.error('   💡 Verifica la configuración de red en MongoDB Atlas');
    }
    
    console.error('   📝 String esperado: mongodb+srv://user:password@cluster.mx7lpcr.mongodb.net/db');
    process.exit(1);
  }
};

module.exports = connectDB;