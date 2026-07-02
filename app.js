const express = require('express');
require('dotenv').config();
require('./src/config/database');

const app = express();
app.use(express.json());

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const candidatoRoutes = require('./src/routes/candidatosRoutes');
const historicoRoutes = require('./src/routes/historicoRoutes');
const vagasRoutes = require('./src/routes/vagasRoutes');

app.use('/usuarios', usuarioRoutes);
app.use('/candidatos', candidatoRoutes);
app.use('/historico', historicoRoutes);
app.use('/vagas', vagasRoutes);

// Rota teste para ver se a api está conectad ao banco
app.get('/', (req, res) => {
    res.json({mensagem: "API conectada e rodando"});
})

module.exports = app;