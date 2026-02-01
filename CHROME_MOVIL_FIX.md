# 🔧 Solución para Chrome Móvil

## Problema
Chrome en Android tiene problemas con localStorage cuando la aplicación está en modo PWA o con ciertas configuraciones de privacidad.

## Soluciones Implementadas

### 1. Doble almacenamiento
- La app ahora guarda la sesión en **localStorage** Y **sessionStorage**
- Chrome móvil detectado automáticamente
- Si falla uno, usa el otro

### 2. Página de logout mejorada
- Limpia localStorage, sessionStorage Y cookies
- Acceso directo: https://control-horario-weld.vercel.app/logout.html

---

## Si Chrome móvil sigue sin funcionar:

### Opción 1: Usar Firefox móvil (RECOMENDADO)
Firefox móvil funciona perfectamente con la aplicación.

### Opción 2: Configurar Chrome móvil

1. **Abre Chrome** en tu móvil
2. Ve a **Configuración** (3 puntos arriba a la derecha)
3. **Privacidad y seguridad**
4. **Borrar datos de navegación**
5. Selecciona:
   - ✅ Cookies y datos de sitios
   - ✅ Imágenes y archivos en caché
6. **Borrar datos**

### Opción 3: Permitir cookies de terceros

1. **Chrome** → **Configuración**
2. **Privacidad y seguridad**
3. **Cookies**
4. Selecciona **"Permitir todas las cookies"** (temporalmente)
5. Intenta entrar de nuevo

### Opción 4: Desactivar "Navegación segura"

1. **Chrome** → **Configuración**
2. **Privacidad y seguridad**
3. **Navegación segura**
4. Selecciona **"Sin protección"** (temporalmente)
5. Intenta entrar de nuevo

### Opción 5: Modo incógnito

1. Abre Chrome en **modo incógnito**
2. Ve a https://control-horario-weld.vercel.app
3. Inicia sesión

---

## Navegadores Recomendados para Móvil

### ✅ Funcionan perfectamente:
- **Firefox** (Android/iOS)
- **Safari** (iOS)
- **Samsung Internet** (Android)
- **Edge** (Android/iOS)

### ⚠️ Pueden tener problemas:
- **Chrome** (Android) - Depende de configuración de privacidad
- **Brave** (Android/iOS) - Bloquea localStorage por defecto

---

## Para Administradores

Si necesitas que todos los empleados usen Chrome móvil:

1. Pídeles que sigan la **Opción 2** (borrar datos)
2. O recomienda usar **Firefox móvil**
3. O considera crear una **app nativa** (React Native)

---

## Verificar si Chrome está bloqueando localStorage

1. Abre Chrome en tu móvil
2. Ve a https://control-horario-weld.vercel.app
3. Presiona los **3 puntos** → **Más herramientas** → **Herramientas para desarrolladores**
4. Ve a **Console**
5. Escribe: `localStorage.setItem('test', '123')`
6. Si da error, Chrome está bloqueando localStorage

---

## Contacto

Si ninguna solución funciona, usa **Firefox móvil** que es 100% compatible.
