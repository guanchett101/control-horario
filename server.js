const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/registros', require('./routes/registros'));
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.json({ message: 'API Control de Horarios' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
