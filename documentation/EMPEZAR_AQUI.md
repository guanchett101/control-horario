# 🎯 EMPIEZA AQUÍ

## ¡Bienvenido al Sistema de Control de Horarios!

Este es tu punto de partida. Sigue estos pasos en orden:

---

## 📚 Paso 1: Lee la Guía Visual (5 min)

👉 **[PASOS_VISUALES.md](PASOS_VISUALES.md)**

Esta guía te muestra EXACTAMENTE qué hacer con capturas y ejemplos visuales.

---

## ⚡ Paso 2: Configuración Rápida (5 min)

### 2.1 Crear Proyecto en Supabase
1. Ve a https://supabase.com
2. Crea cuenta gratis
3. Crea nuevo proyecto llamado "control-horario"
4. Guarda la contraseña

### 2.2 Crear Tablas
1. En Supabase, ve a SQL Editor
2. Copia TODO el contenido de `database/supabase_schema.sql`
3. Pégalo y ejecuta (Run)

### 2.3 Obtener Credenciales
1. En Supabase: Settings → API
2. Copia:
   - Project URL
   - service_role key (¡NO el anon key!)

### 2.4 Configurar Proyecto
```bash
# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
# (usa nano, vim, code, o notepad)
```

### 2.5 Crear Usuario Admin
```bash
# Generar hash de contraseña
npm run generar-password admin123

# Copiar el hash y ejecutar en Supabase SQL Editor:
# UPDATE usuarios SET password_hash = 'tu_hash' WHERE username = 'admin';
```

### 2.6 Verificar
```bash
npm run verificar
```

### 2.7 Iniciar
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run client
```

### 2.8 Probar
Abre http://localhost:3000
- Usuario: admin
- Contraseña: admin123

---

## 📖 Paso 3: Documentación Completa

Una vez que funcione en localhost, explora:

| Documento | Para qué sirve |
|-----------|----------------|
| [README.md](README.md) | Resumen general del proyecto |
| [PASOS_VISUALES.md](PASOS_VISUALES.md) | Guía visual paso a paso |
| [INICIO_RAPIDO.md](INICIO_RAPIDO.md) | Configuración en 5 minutos |
| [SETUP_SUPABASE.md](SETUP_SUPABASE.md) | Configuración detallada de Supabase |
| [GUIA_DEPLOYMENT.md](GUIA_DEPLOYMENT.md) | Cómo poner online (gratis) |
| [EJEMPLOS_API.md](EJEMPLOS_API.md) | Ejemplos de uso de la API |
| [CHECKLIST_DEPLOYMENT.md](CHECKLIST_DEPLOYMENT.md) | Lista antes de desplegar |
| [RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md) | Arquitectura completa |

---

## 🌐 Paso 4: Desplegar Online (Opcional)

Cuando estés listo para ponerlo en internet:

👉 **[GUIA_DEPLOYMENT.md](GUIA_DEPLOYMENT.md)**

Resumen:
1. Sube tu código a GitHub
2. Ve a https://vercel.com
3. Importa tu repositorio
4. Configura variables de entorno
5. Deploy (gratis)

---

## 🆘 ¿Problemas?

### No funciona el login
```bash
# Regenera la contraseña
npm run generar-password admin123

# Actualiza en Supabase SQL Editor
UPDATE usuarios SET password_hash = 'nuevo_hash' WHERE username = 'admin';
```

### Error de conexión a Supabase
```bash
# Verifica tu .env
cat .env

# Debe tener:
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_KEY=eyJhbGciOiJIUzI1NiI...
# JWT_SECRET=algo_aleatorio
```

### Más ayuda
Lee [PASOS_VISUALES.md](PASOS_VISUALES.md) - tiene soluciones detalladas

---

## ✅ Checklist Rápido

- [ ] Proyecto creado en Supabase
- [ ] Tablas creadas (4 tablas)
- [ ] Credenciales copiadas
- [ ] `npm install` ejecutado
- [ ] Archivo `.env` creado y configurado
- [ ] Usuario admin creado
- [ ] `npm run verificar` pasa sin errores
- [ ] Backend corriendo (puerto 3001)
- [ ] Frontend corriendo (puerto 3000)
- [ ] Login funciona

---

## 🎉 ¡Listo!

Si completaste el checklist, tu sistema está funcionando.

**Próximos pasos:**
1. Cambia la contraseña del admin
2. Crea empleados de prueba
3. Prueba registrar entrada/salida
4. Explora los reportes
5. Cuando estés listo, despliega online

---

## 💡 Tips

- **Localhost primero:** Asegúrate de que todo funcione localmente antes de desplegar
- **Guarda credenciales:** Anota tus credenciales de Supabase en un lugar seguro
- **Lee la documentación:** Cada archivo MD tiene información útil
- **Pide ayuda:** Si algo no funciona, revisa [PASOS_VISUALES.md](PASOS_VISUALES.md)

---

## 🚀 Comandos Útiles

```bash
npm run dev              # Iniciar backend
npm run client           # Iniciar frontend
npm run verificar        # Verificar configuración
npm run generar-password # Generar hash de contraseña
npm run build           # Build del frontend
```

---

**¿Listo para empezar?** 👉 [PASOS_VISUALES.md](PASOS_VISUALES.md)
