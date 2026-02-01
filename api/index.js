const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/empleados', require('../routes/empleados'));
app.use('/api/registros', require('../routes/registros'));
app.use('/api/auth', require('../routes/auth'));

app.get('/api', (req, res) => {
  res.json({ message: 'API Control de Horarios funcionando' });
});

module.exports = app;
