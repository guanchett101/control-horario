# ✅ Checklist de Deployment

## 📋 Antes de Desplegar

### Configuración Local
- [ ] Proyecto funciona en localhost
- [ ] Login funciona correctamente
- [ ] Puedes crear empleados
- [ ] Puedes registrar entrada/salida
- [ ] Los reportes muestran datos

### Supabase
- [ ] Proyecto creado en Supabase
- [ ] Todas las tablas creadas (4 tablas)
- [ ] Usuario admin creado y funciona
- [ ] Credenciales guardadas de forma segura

### Código
- [ ] Archivo `.env` configurado (NO subir a Git)
- [ ] `.gitignore` incluye `.env`
- [ ] Código subido a GitHub
- [ ] README actualizado

---

## 🚀 Deployment en Vercel

### Backend

1. **Preparar el proyecto**
   - [ ] Código en GitHub
   - [ ] `vercel.json` configurado
   - [ ] Variables de entorno identificadas

2. **Crear proyecto en Vercel**
   - [ ] Cuenta creada en vercel.com
   - [ ] Repositorio importado
   - [ ] Framework: Other
   - [ ] Root Directory: (vacío)

3. **Configurar variables de entorno**
   - [ ] `SUPABASE_URL` agregada
   - [ ] `SUPABASE_KEY` agregada
   - [ ] `JWT_SECRET` agregada

4. **Deploy**
   - [ ] Deploy exitoso
   - [ ] URL del backend copiada (ej: https://tu-backend.vercel.app)
   - [ ] Probar endpoint: `https://tu-backend.vercel.app/api/empleados`

### Frontend

1. **Actualizar configuración**
   - [ ] Crear `client/.env.production`:
     ```
     REACT_APP_API_URL=https://tu-backend.vercel.app/api
     ```

2. **Crear proyecto en Vercel**
   - [ ] Nuevo proyecto en Vercel
   - [ ] Mismo repositorio
   - [ ] Framework: Create React App
   - [ ] Root Directory: `client`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `build`

3. **Configurar variables**
   - [ ] `REACT_APP_API_URL` agregada

4. **Deploy**
   - [ ] Deploy exitoso
   - [ ] URL del frontend copiada
   - [ ] Sitio accesible

---

## 🧪 Pruebas Post-Deployment

### Funcionalidad Básica
- [ ] Sitio carga correctamente
- [ ] Login funciona
- [ ] Dashboard muestra datos
- [ ] Puedes registrar entrada
- [ ] Puedes registrar salida

### Funcionalidad Admin
- [ ] Puedes crear empleados
- [ ] Lista de empleados se actualiza
- [ ] Reportes funcionan
- [ ] Filtros por fecha funcionan

### Performance
- [ ] Sitio carga en menos de 3 segundos
- [ ] No hay errores en la consola
- [ ] Imágenes/recursos cargan correctamente

---

## 🔒 Seguridad

### Credenciales
- [ ] Contraseña de admin cambiada
- [ ] `JWT_SECRET` es aleatorio y seguro
- [ ] Variables de entorno NO están en el código
- [ ] `.env` está en `.gitignore`

### Supabase
- [ ] Row Level Security (RLS) configurado (opcional)
- [ ] Solo service_role key en backend
- [ ] Anon key solo en frontend (si usas Supabase directamente)

### HTTPS
- [ ] Sitio usa HTTPS (Vercel lo hace automático)
- [ ] No hay contenido mixto (HTTP/HTTPS)

---

## 📱 Configuración de Dominio (Opcional)

Si tienes dominio propio:

- [ ] Dominio comprado
- [ ] DNS configurado en Vercel
- [ ] Certificado SSL activo
- [ ] Redirección www → no-www (o viceversa)
- [ ] URLs actualizadas en el código

---

## 🔧 Mantenimiento

### Monitoreo
- [ ] Configurar alertas en Vercel
- [ ] Revisar logs regularmente
- [ ] Monitorear uso de Supabase

### Backups
- [ ] Backups automáticos de Supabase activos
- [ ] Código respaldado en GitHub
- [ ] Documentación actualizada

### Actualizaciones
- [ ] Plan para actualizar dependencias
- [ ] Proceso de deploy documentado
- [ ] Rollback plan definido

---

## 📊 Límites a Monitorear

### Supabase (Plan Gratuito)
- [ ] Uso de base de datos: ____ / 500MB
- [ ] Usuarios activos: ____ / 50,000/mes
- [ ] Storage: ____ / 2GB

### Vercel (Plan Gratuito)
- [ ] Bandwidth: ____ / 100GB/mes
- [ ] Builds: ____ / 6,000 minutos/mes

---

## 🎉 Post-Launch

### Comunicación
- [ ] Informar a empleados sobre el nuevo sistema
- [ ] Enviar credenciales de acceso
- [ ] Proporcionar guía de uso
- [ ] Establecer canal de soporte

### Capacitación
- [ ] Demo del sistema
- [ ] Manual de usuario creado
- [ ] Video tutorial (opcional)
- [ ] Sesión de preguntas y respuestas

### Feedback
- [ ] Recopilar feedback inicial
- [ ] Identificar mejoras necesarias
- [ ] Planificar próximas funcionalidades

---

## 🆘 Troubleshooting

### Si algo falla:

1. **Revisar logs**
   - Vercel: Dashboard → Deployments → Logs
   - Supabase: Dashboard → Logs

2. **Verificar variables de entorno**
   - Vercel: Settings → Environment Variables
   - Confirmar que no hay espacios extra

3. **Probar endpoints**
   - Backend: `https://tu-backend.vercel.app/api/empleados`
   - Debe retornar JSON

4. **Revisar consola del navegador**
   - F12 → Console
   - Buscar errores de CORS o red

5. **Rollback si es necesario**
   - Vercel permite volver a deployment anterior
   - Dashboard → Deployments → Promote to Production

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa la documentación en los archivos MD
2. Consulta logs de Vercel y Supabase
3. Revisa la consola del navegador
4. Verifica que todas las variables de entorno estén correctas

---

## ✨ ¡Felicidades!

Si completaste todos los checkboxes, tu sistema está en producción y listo para usar.

**URLs importantes:**
- Frontend: ___________________________
- Backend: ___________________________
- Supabase: ___________________________
- GitHub: ___________________________
