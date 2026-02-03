# Ejemplos de Uso de la API

## 🔐 Autenticación

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "empleadoId": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "rol": "admin"
  }
}
```

### Registrar Usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "empleadoId": 1,
    "username": "admin",
    "password": "admin123",
    "rol": "admin"
  }'
```

---

## 👥 Empleados

### Listar Todos los Empleados
```bash
curl http://localhost:3001/api/empleados
```

### Obtener Empleado por ID
```bash
curl http://localhost:3001/api/empleados/1
```

### Crear Empleado
```bash
curl -X POST http://localhost:3001/api/empleados \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@empresa.com",
    "telefono": "555-1234",
    "cargo": "Desarrollador",
    "fechaIngreso": "2026-02-01"
  }'
```

### Actualizar Empleado
```bash
curl -X PUT http://localhost:3001/api/empleados/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "apellido": "Pérez",
    "email": "juancarlos@empresa.com",
    "telefono": "555-5678",
    "cargo": "Senior Developer"
  }'
```

### Desactivar Empleado
```bash
curl -X DELETE http://localhost:3001/api/empleados/1
```

---

## ⏰ Registros de Horario

### Registrar Entrada
```bash
curl -X POST http://localhost:3001/api/registros/entrada \
  -H "Content-Type: application/json" \
  -d '{
    "empleadoId": 1
  }'
```

Respuesta:
```json
{
  "id": 1,
  "message": "Entrada registrada",
  "hora": "09:00:00"
}
```

### Registrar Salida
```bash
curl -X POST http://localhost:3001/api/registros/salida \
  -H "Content-Type: application/json" \
  -d '{
    "empleadoId": 1
  }'
```

Respuesta:
```json
{
  "message": "Salida registrada",
  "hora": "18:00:00"
}
```

### Obtener Registros de Hoy
```bash
curl http://localhost:3001/api/registros/hoy
```

Respuesta:
```json
[
  {
    "id": 1,
    "empleado_id": 1,
    "fecha": "2026-02-01",
    "hora_entrada": "09:00:00",
    "hora_salida": "18:00:00",
    "observaciones": null,
    "empleados": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "cargo": "Desarrollador"
    }
  }
]
```

### Obtener Registros por Empleado y Fechas
```bash
curl "http://localhost:3001/api/registros/empleado/1?fechaInicio=2026-02-01&fechaFin=2026-02-28"
```

---

## 🧪 Probar con JavaScript (Frontend)

### Login
```javascript
const login = async () => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  console.log(data);
  
  // Guardar token
  localStorage.setItem('token', data.token);
};
```

### Registrar Entrada
```javascript
const registrarEntrada = async (empleadoId) => {
  const response = await fetch('http://localhost:3001/api/registros/entrada', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ empleadoId })
  });
  
  const data = await response.json();
  console.log(data);
};
```

### Obtener Empleados
```javascript
const obtenerEmpleados = async () => {
  const response = await fetch('http://localhost:3001/api/empleados');
  const empleados = await response.json();
  console.log(empleados);
};
```

---

## 🔒 Usando Token de Autenticación

Si implementas middleware de autenticación, usa el token así:

```bash
curl http://localhost:3001/api/empleados \
  -H "Authorization: Bearer tu_token_aqui"
```

En JavaScript:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3001/api/empleados', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📱 Ejemplo Completo: Flujo de Trabajo

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const { token, user } = await loginResponse.json();

// 2. Registrar entrada
await fetch('http://localhost:3001/api/registros/entrada', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ empleadoId: user.empleadoId })
});

// 3. Ver registros del día
const registrosResponse = await fetch('http://localhost:3001/api/registros/hoy');
const registros = await registrosResponse.json();
console.log(registros);

// 4. Registrar salida
await fetch('http://localhost:3001/api/registros/salida', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ empleadoId: user.empleadoId })
});
```

---

## 🐛 Códigos de Error

- `200` - OK
- `201` - Creado exitosamente
- `400` - Solicitud incorrecta
- `401` - No autorizado (credenciales inválidas)
- `404` - No encontrado
- `500` - Error del servidor

---

## 💡 Tips

1. Usa Postman o Insomnia para probar la API más fácilmente
2. El token JWT expira en 8 horas
3. Todas las fechas están en formato ISO (YYYY-MM-DD)
4. Las horas están en formato 24h (HH:MM:SS)
