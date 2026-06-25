const express = require('express');
require('dotenv').config();
require('./src/config/database');

const app = express();
app.use(express.json());

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const candidatoRoutes = require('./src/routes/candidatosRoutes');

app.use('/usuarios', usuarioRoutes);
app.use('/candidatos', candidatoRoutes);

// Rota teste para ver se a api está conectad ao banco
app.get('/', (req, res) => {
    res.json({mensagem: "API conectada e rodando"});
})

module.exports = app;