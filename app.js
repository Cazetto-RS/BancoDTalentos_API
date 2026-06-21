const express = require('express');
require('dotenv').config();

require('./src/config/database');

const app = express();

app.use(express.json());

// Rota teste para ver se a api está conectad ao banco
app.get('/', (req, res) => {
    res.json({mensagem: "API conectada e rodando"});
})

module.exports = app;