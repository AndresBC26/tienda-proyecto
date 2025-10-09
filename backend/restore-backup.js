// restore-backup.js - Restaurar configuración original
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
}