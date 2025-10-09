# 🚨 PROTOCOLO DE EMERGENCIA - Servidor en Producción

## 🔍 Situación Actual
- ❌ Error 404: Rutas no encontradas
- ❌ Error 500: Error interno del servidor
- ❌ Subida de imágenes no funciona
- ❌ Panel de admin inaccesible

## 🚀 SOLUCIÓN DE EMERGENCIA INMEDIATA

### Paso 1: Activar Modo de Emergencia
```bash
cd backend
node emergency-switch.js
```

### Paso 2: Desplegar Cambios
```bash
git add .
git commit -m "EMERGENCY: Activar rutas simplificadas para debugging"
git push origin main
```

### Paso 3: Verificar Estado del Servidor
Una vez desplegado, verifica estos endpoints:

1. **Estado básico:**
   ```
   https://tienda-proyecto.onrender.com/api/health/ping
   ```

2. **Diagnóstico completo:**
   ```
   https://tienda-proyecto.onrender.com/api/health/diagnosis
   ```

3. **Lista de rutas:**
   ```
   https://tienda-proyecto.onrender.com/api/health/routes
   ```

4. **Productos (sin auth):**
   ```
   https://tienda-proyecto.onrender.com/api/products
   ```

## 🔧 Características del Modo de Emergencia

### ✅ Rutas Simplificadas Activas:
- `GET /api/products` - Sin autenticación
- `POST /api/products` - Con autenticación simple
- `PUT /api/products/:id` - Con autenticación simple
- `DELETE /api/products/:id` - Con autenticación simple
- `POST /api/products/test` - Endpoint de prueba

### ✅ Logging Detallado:
- Todos los requests se loggean
- Errores específicos con stack trace
- Información de autenticación detallada
- Estado de archivos subidos

### ✅ Autenticación Simplificada:
- Manejo robusto de tokens
- Mensajes de error específicos
- Debugging de headers y tokens

## 🧪 Pruebas de Funcionalidad

### 1. Probar Autenticación
```javascript
// En la consola del navegador
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Presente' : 'Ausente');

fetch('https://tienda-proyecto.onrender.com/api/products/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ test: true })
})
.then(res => res.json())
.then(data => console.log('Test result:', data));
```

### 2. Probar Subida de Imagen
```javascript
// Con un archivo de imagen seleccionado
const token = localStorage.getItem('token');
const formData = new FormData();
formData.append('testImage', file); // 'file' es tu archivo de imagen

fetch('https://tienda-proyecto.onrender.com/api/products/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log('Upload test:', data));
```

## 📊 Interpretación de Logs

### ✅ Logs Exitosos:
```
✅ Auth successful: { userId: "...", email: "...", role: "admin" }
✅ Image uploaded: https://res.cloudinary.com/...
✅ Product created: 507f1f77bcf86cd799439011
```

### ❌ Logs de Error:
```
❌ No token provided
❌ Token verification failed: jwt expired
❌ Error creating product: ValidationError
```

## 🔍 Debugging Específico

### Si el endpoint /api/health/ping falla:
- El servidor no está iniciando correctamente
- Problema con las variables de entorno
- Error en el código del servidor

### Si /api/health/diagnosis muestra errores:
- **Database: Error** → Problema con MongoDB
- **Cloudinary: Error** → Problema con credenciales de Cloudinary
- **Environment: false** → Variables de entorno faltantes

### Si la autenticación falla:
- Verificar que el token existe: `localStorage.getItem('token')`
- Verificar que el usuario es admin en la base de datos
- Revisar logs del servidor para errores JWT

## 🛠️ Soluciones por Tipo de Error

### Error: "Database: Disconnected"
1. Verificar MONGODB_URI en Render
2. Verificar que MongoDB Atlas permite conexiones desde Render
3. Verificar que la base de datos existe

### Error: "Cloudinary: Not Configured"
1. Verificar variables en Render:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

### Error: "Token inválido"
1. Cerrar sesión y volver a iniciar
2. Verificar JWT_SECRET en Render
3. Verificar que el usuario existe en la base de datos

## 📋 Checklist de Verificación

### En Render:
- [ ] Servicio desplegado sin errores
- [ ] Variables de entorno configuradas
- [ ] Logs sin errores críticos
- [ ] Endpoint /api/health/ping responde

### En el Frontend:
- [ ] Usuario logueado como admin
- [ ] Token presente en localStorage
- [ ] REACT_APP_API_URL correcto
- [ ] Sin errores en consola del navegador

### Funcionalidad:
- [ ] Listar productos funciona
- [ ] Endpoint de prueba funciona
- [ ] Autenticación funciona
- [ ] Subida de imagen de prueba funciona

## 🔄 Restaurar Configuración Normal

Una vez que identifiques y soluciones el problema:

```bash
cd backend
node restore-backup.js
git add .
git commit -m "Restaurar configuración normal después de debugging"
git push origin main
```

## 📞 Escalación

Si el modo de emergencia no resuelve el problema:

1. **Revisar logs de Render** para errores específicos
2. **Verificar estado de MongoDB Atlas**
3. **Verificar estado de Cloudinary**
4. **Considerar rollback** a una versión anterior que funcionaba
5. **Contactar soporte** de Render si es necesario

## ⚡ Comandos Rápidos

```bash
# Activar emergencia
node emergency-switch.js && git add . && git commit -m "EMERGENCY MODE" && git push

# Verificar estado
curl https://tienda-proyecto.onrender.com/api/health/ping

# Restaurar normal
node restore-backup.js && git add . && git commit -m "RESTORE NORMAL" && git push
```

Este protocolo de emergencia te permitirá identificar y solucionar el problema específico que está causando los errores 404 y 500 en producción.
