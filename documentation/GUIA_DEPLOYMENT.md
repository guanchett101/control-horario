# Guía: De Localhost a Producción Online

## FASE 1: DESARROLLO LOCAL (Localhost)

### Requisitos
- Node.js instalado
- Firebird instalado
- Tu código del proyecto

### Pasos
```bash
# 1. Instalar dependencias
npm install
cd client && npm install && cd ..

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus datos locales

# 3. Crear base de datos Firebird local
# Ejecutar database/schema.sql

# 4. Probar localmente
# Terminal 1:
npm run dev

# Terminal 2:
npm run client

# 5. Acceder en navegador
# http://localhost:3000
```

**Resultado:** Sistema funcionando solo en tu computadora

---

## FASE 2: PREPARAR PARA PRODUCCIÓN

### 1. Construir el Frontend
```bash
cd client
npm run build
cd ..
```

Esto crea una carpeta `client/build` con archivos optimizados.

### 2. Configurar el Backend para servir el Frontend

Edita `server.js` y agrega al final (antes de `app.listen`):

```javascript
// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
```

### 3. Actualizar package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "client": "cd client && npm start",
    "build": "cd client && npm run build",
    "heroku-postbuild": "npm run build"
  }
}
```

---

## FASE 3: DESPLEGAR EN SERVIDOR (VPS)

### Opción A: DigitalOcean / Linode / Vultr

#### 1. Crear Droplet/VPS
- Ubuntu 22.04 LTS
- Plan básico ($5-10/mes)
- Obtener IP pública

#### 2. Conectar por SSH
```bash
ssh root@tu-ip-del-servidor
```

#### 3. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

#### 4. Instalar Firebird
```bash
apt-get update
apt-get install firebird3.0-server firebird3.0-utils
```

#### 5. Subir tu código
```bash
# Opción 1: Git (recomendado)
git clone https://github.com/tu-usuario/control-horario.git
cd control-horario

# Opción 2: SCP desde tu computadora
scp -r /ruta/local/proyecto root@tu-ip:/root/control-horario
```

#### 6. Configurar en el servidor
```bash
# Instalar dependencias
npm install
cd client && npm install && npm run build && cd ..

# Crear .env con datos del servidor
nano .env
```

Contenido del `.env` en producción:
```
PORT=3001
DB_HOST=localhost
DB_PORT=3050
DB_DATABASE=/var/lib/firebird/data/control_horario.fdb
DB_USER=SYSDBA
DB_PASSWORD=tu_password_seguro
JWT_SECRET=clave_super_secreta_cambiala
NODE_ENV=production
```

#### 7. Crear base de datos en el servidor
```bash
isql-fb
CREATE DATABASE '/var/lib/firebird/data/control_horario.fdb';
INPUT '/root/control-horario/database/schema.sql';
QUIT;
```

#### 8. Instalar PM2 (mantiene el servidor corriendo)
```bash
npm install -g pm2
pm2 start server.js --name control-horario
pm2 startup
pm2 save
```

#### 9. Configurar Nginx (servidor web)
```bash
apt-get install nginx

# Crear configuración
nano /etc/nginx/sites-available/control-horario
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar configuración
ln -s /etc/nginx/sites-available/control-horario /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 10. Instalar SSL (HTTPS gratis)
```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d tu-dominio.com
```

#### 11. Configurar Firewall
```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

**¡Listo!** Tu sistema está online en `https://tu-dominio.com`

---

## FASE 4: CONFIGURAR DOMINIO

### 1. Comprar dominio
- Namecheap, GoDaddy, Google Domains (~$10-15/año)

### 2. Configurar DNS
En el panel de tu proveedor de dominio:

```
Tipo: A
Nombre: @
Valor: IP-de-tu-servidor
TTL: 3600

Tipo: A
Nombre: www
Valor: IP-de-tu-servidor
TTL: 3600
```

Espera 1-24 horas para que se propague.

---

## MANTENIMIENTO

### Ver logs del servidor
```bash
pm2 logs control-horario
```

### Reiniciar servidor
```bash
pm2 restart control-horario
```

### Actualizar código
```bash
cd /root/control-horario
git pull
npm install
cd client && npm install && npm run build && cd ..
pm2 restart control-horario
```

### Backup de base de datos
```bash
# Crear backup
gbak -b /var/lib/firebird/data/control_horario.fdb /backups/control_horario_$(date +%Y%m%d).fbk

# Restaurar backup
gbak -r /backups/control_horario_20260201.fbk /var/lib/firebird/data/control_horario.fdb
```

---

## COSTOS ESTIMADOS

### Desarrollo (Localhost)
- **Costo: $0** (solo tu computadora)

### Producción Básica
- VPS: $5-10/mes
- Dominio: $10-15/año
- SSL: Gratis (Let's Encrypt)
- **Total: ~$6-11/mes**

### Producción Profesional
- VPS mejor: $20-40/mes
- Dominio: $10-15/año
- Backup automático: $5/mes
- Monitoreo: $10/mes
- **Total: ~$35-55/mes**

---

## RESUMEN RÁPIDO

1. **Localhost**: Desarrolla y prueba en tu PC
2. **Build**: Compila el frontend (`npm run build`)
3. **VPS**: Contrata servidor en la nube
4. **Deploy**: Sube código, instala dependencias
5. **Dominio**: Configura tu-empresa.com
6. **SSL**: Activa HTTPS
7. **¡Online!**: Accesible desde cualquier lugar

---

## ALTERNATIVA SIMPLE: Railway.app

Si quieres algo más fácil (pero necesitas cambiar a PostgreSQL):

1. Crea cuenta en railway.app
2. Conecta tu repositorio GitHub
3. Railway detecta Node.js automáticamente
4. Agrega PostgreSQL desde el panel
5. Configura variables de entorno
6. ¡Deploy automático!

**Limitación**: No soporta Firebird, necesitas migrar a PostgreSQL.
