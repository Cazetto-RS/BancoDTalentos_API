require('dotenv').config();

const app = require('../../app');
const env = require('../config/env')
const db = require('../config/database');
const UsuarioModel = require('../models/usuarioModels');

const PORT = env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', async () => {
    try {
        await db.query('SELECT 1');
        await UsuarioModel.expurgarContasVencidas();
        console.log(`Servidor e banco conectados na porta ${PORT}`);
    } catch (error) {
        console.error('Servidor iniciado, mas não foi possível conectar ao banco:', error.message);
    }
});

const cleanupTimer = setInterval(() => {
    UsuarioModel.expurgarContasVencidas().catch((error) => console.error('Falha ao excluir contas vencidas:', error));
}, 6 * 60 * 60 * 1000);
cleanupTimer.unref();

const encerrar = (signal) => {
    console.log(`${signal} recebido. Encerrando servidor...`);
    server.close(async () => {
        await db.close();
        process.exit(0);
    });
};

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
