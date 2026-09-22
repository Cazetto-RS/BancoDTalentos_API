require('dotenv').config();

const app = require('../../app');
const env = require('../config/env')
const db = require('../config/database');

const PORT = env.PORT || 3000;

const server = app.listen(PORT, async () => {
    try {
        await db.query('SELECT 1');
        console.log(`Servidor e banco conectados na porta ${PORT}`);
    } catch (error) {
        console.error('Servidor iniciado, mas não foi possível conectar ao banco:', error.message);
    }
});

const encerrar = (signal) => {
    console.log(`${signal} recebido. Encerrando servidor...`);
    server.close(async () => {
        await db.close();
        process.exit(0);
    });
};

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
