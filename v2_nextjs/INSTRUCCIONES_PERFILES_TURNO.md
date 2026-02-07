# 🎯 Sistema de Perfiles de Turno - Instrucciones de Instalación

## 📋 ¿Qué es esto?

Un sistema para crear **perfiles de turno reutilizables** que puedes asignar a tus empleados. En lugar de configurar horarios individualmente para cada empleado, creas perfiles una vez y los asignas.

## ✨ Ventajas

- ✅ **Reutilizable**: Crea un perfil y asígnalo a múltiples empleados
- ✅ **Flexible**: Soporta horario continuo (con/sin pausa) y horario partido
- ✅ **Escalable**: Agrega nuevos perfiles cuando quieras
- ✅ **Cálculo automático**: El sistema calcula horas efectivas restando pausas
- ✅ **Fácil de usar**: Interfaz visual para gestionar perfiles

## 📊 Tipos de Perfiles Incluidos

### 1. Oficina Estándar
```
Tipo: Continuo
Horario: 09:00 - 18:00
Pausa: 14:00 - 15:00 (1 hora)
Horas efectivas: 8 horas
```

### 2. Jornada Intensiva
```
Tipo: Continuo
Horario: 09:00 - 15:00
Sin pausa
Horas efectivas: 6 horas
```

### 3. Horario Partido
```
Tipo: Partido
Mañana: 09:00 - 13:00
Tarde: 15:00 - 19:00
Horas efectivas: 8 horas
```

### 4. Turno Mañana
```
Tipo: Continuo
Horario: 06:00 - 14:00
Pausa: 10:00 - 10:30 (30 min)
Horas efectivas: 7.5 horas
```

### 5. Turno Tarde
```
Tipo: Continuo
Horario: 14:00 - 22:00
Pausa: 18:00 - 18:30 (30 min)
Horas efectivas: 7.5 horas
```

### 6. Turno Noche
```
Tipo: Continuo
Horario: 22:00 - 06:00
Pausa: 02:00 - 03:00 (1 hora)
Horas efectivas: 7 horas
```

---

## 🚀 PASO 1: Ejecutar SQL en Supabase

### 1.1 Abrir SQL Editor

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **"New query"**

### 1.2 Copiar y Ejecutar el SQL

1. Abre el archivo: `v2_nextjs/CREAR_PERFILES_TURNO.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **"Run"** (o presiona Ctrl+Enter)

### 1.3 Verificar Creación

Deberías ver un mensaje de éxito y una tabla con los 6 perfiles creados.

Si hay algún error, léelo cuidadosamente. Los errores comunes son:
- Tabla ya existe: No pasa nada, el SQL usa `IF NOT EXISTS`
- Columna ya existe: No pasa nada, el SQL usa `IF NOT EXISTS`

---

## 🚀 PASO 2: Desplegar Código

### 2.1 Commit y Push

```bash
git add .
git commit -m "feat: sistema de perfiles de turno reutilizables"
git push origin main
```

### 2.2 Verificar Deploy en Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: `control-horario100`
3. Verás un nuevo deploy en progreso
4. Espera 1-2 minutos a que termine

---

## 🎯 PASO 3: Usar el Sistema

### 3.1 Acceder a Perfiles de Turno

1. Inicia sesión como **admin**
2. En el menú superior verás un nuevo enlace: **"Turnos"** (o ⏰ en móvil)
3. Haz clic para acceder

### 3.2 Ver Perfiles Predefinidos

Verás 6 perfiles ya creados:
- Oficina Estándar
- Jornada Intensiva
- Horario Partido
- Turno Mañana
- Turno Tarde
- Turno Noche

### 3.3 Crear Nuevo Perfil

1. Haz clic en **"+ Nuevo Perfil"**
2. Rellena el formulario:
   - **Nombre**: Ej: "Verano Intensivo"
   - **Descripción**: Opcional
   - **Tipo**: Continuo o Partido
   - **Horario Principal**: Entrada y Salida
   - **Pausa** (solo continuo): Opcional
   - **Turno Tarde** (solo partido): Obligatorio
3. Haz clic en **"✅ Crear"**

### 3.4 Editar Perfil

1. Haz clic en **"✏️ Editar"** en cualquier perfil
2. Modifica los campos que necesites
3. Haz clic en **"💾 Guardar"**

### 3.5 Eliminar Perfil

1. Haz clic en **"🗑️ Eliminar"**
2. Confirma la acción
3. El perfil se marca como inactivo (no se borra de la BD)

---

## 📝 PASO 4: Asignar Perfiles a Empleados (Próximo)

En la siguiente actualización, podrás:

1. Ir a **Empleados**
2. Al crear/editar un empleado, seleccionar un perfil de turno
3. El sistema usará automáticamente ese perfil para:
   - Calcular horas trabajadas
   - Enviar avisos por email
   - Generar reportes

---

## 🔧 Cómo Funciona Internamente

### Prioridad de Horarios

```javascript
// Al calcular horas o enviar avisos:
if (empleado.perfil_turno_id) {
  // Usar horario del perfil
  const perfil = obtenerPerfil(empleado.perfil_turno_id);
  horario = perfil.hora_entrada;
} else {
  // Usar horario individual del empleado (fallback)
  horario = empleado.horario_entrada;
}
```

### Cálculo de Horas Efectivas

**Horario Continuo con Pausa:**
```javascript
const totalMinutos = (horaSalida - horaEntrada);
const pausaMinutos = (pausaFin - pausaInicio);
const horasEfectivas = totalMinutos - pausaMinutos;
```

**Horario Partido:**
```javascript
const turnoManana = (horaSalida - horaEntrada);
const turnoTarde = (horaSalidaTarde - horaEntradaTarde);
const horasEfectivas = turnoManana + turnoTarde;
```

---

## 🎨 Interfaz

### Vista Escritorio
- Grid de tarjetas (3 columnas)
- Cada tarjeta muestra:
  - Nombre del perfil
  - Badge con tipo (continuo/partido)
  - Descripción
  - Horarios detallados
  - Horas efectivas calculadas
  - Botones Editar/Eliminar

### Vista Móvil
- Lista vertical de tarjetas
- Diseño adaptado a pantalla pequeña
- Misma información pero optimizada

---

## 📊 Ejemplos de Uso

### Caso 1: Empresa con Horario Estándar

Todos los empleados trabajan 9-18h con 1h de comida:

1. Usa el perfil **"Oficina Estándar"**
2. Asigna ese perfil a todos los empleados
3. Listo, todos tienen el mismo horario

### Caso 2: Empresa con Turnos Rotativos

Tienes empleados en 3 turnos:

1. Usa perfiles: **"Turno Mañana"**, **"Turno Tarde"**, **"Turno Noche"**
2. Asigna cada empleado a su turno
3. El sistema calcula automáticamente según su turno

### Caso 3: Horarios Mixtos

Algunos empleados tienen horario continuo, otros partido:

1. Crea perfiles para cada tipo
2. Asigna según corresponda
3. El sistema maneja ambos tipos correctamente

---

## ✅ Checklist de Instalación

- [ ] SQL ejecutado en Supabase sin errores
- [ ] Tabla `perfiles_turno` creada
- [ ] 6 perfiles predefinidos insertados
- [ ] Columna `perfil_turno_id` agregada a `empleados`
- [ ] Código commiteado y pusheado a GitHub
- [ ] Deploy completado en Vercel
- [ ] Enlace "Turnos" visible en Navbar (como admin)
- [ ] Página `/perfiles-turno` accesible
- [ ] Puedes ver los 6 perfiles predefinidos
- [ ] Puedes crear un nuevo perfil de prueba
- [ ] Puedes editar un perfil
- [ ] Puedes eliminar un perfil

---

## 🔮 Próximas Mejoras

1. **Asignar perfiles a empleados** (próxima actualización)
2. **Usar perfiles en cálculo de horas**
3. **Usar perfiles en avisos por email**
4. **Reportes por perfil de turno**
5. **Estadísticas de uso de perfiles**

---

## 🆘 Solución de Problemas

### Error: "relation perfiles_turno already exists"

**Solución**: La tabla ya existe. No pasa nada, puedes continuar.

### Error: "column perfil_turno_id already exists"

**Solución**: La columna ya existe. No pasa nada, puedes continuar.

### No veo el enlace "Turnos" en el Navbar

**Solución**: 
1. Verifica que estás logueado como **admin**
2. Refresca la página (Ctrl+F5)
3. Verifica que el deploy de Vercel terminó

### Página /perfiles-turno da error 404

**Solución**:
1. Verifica que el deploy de Vercel terminó
2. Espera 1-2 minutos más
3. Limpia caché del navegador

### No puedo crear perfiles

**Solución**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Si dice "401 Unauthorized", verifica que estás logueado como admin

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta guía completa
2. Verifica los logs en Vercel (Dashboard → Functions → Logs)
3. Verifica los logs en Supabase (SQL Editor → ejecuta queries de verificación)

---

**Fecha de Creación**: 7 de Febrero de 2026  
**Versión**: 1.0  
**Estado**: Listo para Implementar  
**Tiempo Estimado**: 10-15 minutos
