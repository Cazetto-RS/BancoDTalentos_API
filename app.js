const express = require('express');
require('dotenv').config();
require('./src/config/database');

const app = express();
app.use(express.json());

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const candidatoRoutes = require('./src/routes/candidatosRoutes');
const historicoRoutes = require('./src/routes/historicoRoutes');
const vagasRoutes = require('./src/routes/vagasRoutes');
const candidaturasRoutes = require('./src/routes/candidaturaRoutes');
const habilidadesRoutes = require('./src/routes/habilidadesRoutes');
const habilidadesCandidatoRoutes = require('./src/routes/habilidadesCandidatosRoutes');

app.use('/usuarios', usuarioRoutes);
app.use('/candidatos', candidatoRoutes);
app.use('/historico', historicoRoutes);
app.use('/vagas', vagasRoutes);
app.use('/candidaturas', candidaturasRoutes);
app.use('/habilidades', habilidadesRoutes);
app.use('/habilidades-candidatos', habilidadesCandidatoRoutes)

// Rota teste para ver se a api está conectad ao banco
app.get('/', (req, res) => {
    res.json({mensagem: "API conectada e rodando"});
})

module.exports = app;