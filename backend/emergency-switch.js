// emergency-switch.js - Script para cambiar a rutas simplificadas
const fs = require('fs');
const path = require('path');

console.log('🚨 ACTIVANDO MODO DE EMERGENCIA');
console.log('================================');

// Backup del server.js actual
const serverPath = path.join(__dirname, 'server.js');
const backupPath = path.join(__dirname, 'server.js.backup');

try {
  // Crear backup
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  fs.writeFileSync(backupPath, serverContent);
  console.log('✅ Backup creado: server.js.backup');
  
  // Reemplazar la línea de rutas de productos
  const newContent = serverContent.replace(
    "app.use('/api/products', require('./routes/product.routes'));",
    "app.use('/api/products', require('./routes/product-simple.routes'));"
  );
  
  fs.writeFileSync(serverPath, newContent);
  console.log('✅ Rutas cambiadas a versión simplificada');
  
  console.log('\n📋 CAMBIOS REALIZADOS:');
  console.log('- ✅ Backup del server.js original');
  console.log('- ✅ Activadas rutas simplificadas');
  console.log('- ✅ Logging detallado habilitado');
  console.log('- ✅ Autenticación simplificada');
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. Hacer commit y push de los cambios');
  console.log('2. Esperar el redeploy en Render');
  console.log('3. Probar con: https://tienda-proyecto.onrender.com/api/health/ping');
  console.log('4. Probar productos: https://tienda-proyecto.onrender.com/api/products');
  
  console.log('\n🔄 PARA REVERTIR:');
  console.log('node restore-backup.js');
  
} catch (error) {
  console.error('❌ Error al activar modo de emergencia:', error.message);
}

// Crear script de restauración
const restoreScript = `// restore-backup.js - Restaurar configuración original
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
const backupPath = path.join(__dirname, 'server.js.backup');

try {
  if (fs.existsSync(backupPath)) {
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(serverPath, backupContent);
    console.log('✅ Configuración original restaurada');
    fs.unlinkSync(backupPath);
    console.log('✅ Backup eliminado');
  } else {
    console.log('❌ No se encontró el archivo de backup');
  }
} catch (error) {
  console.error('❌ Error al restaurar:', error.message);
}`;

fs.writeFileSync(path.join(__dirname, 'restore-backup.js'), restoreScript);
console.log('✅ Script de restauración creado: restore-backup.js');
