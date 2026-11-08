require('dotenv').config();

const app = require('../../app');
const env = require('../config/env')
const db = require('../config/database');
const UsuarioModel = require('../models/usuarioModels');
const ensureEmailSchema = require('../config/ensureEmailSchema');

const PORT = env.PORT || 3000;

let server;

async function iniciar() {
    try {
        await db.query('SELECT 1');
        await ensureEmailSchema();
        await UsuarioModel.expurgarContasVencidas();
        await db.query("DELETE FROM tentativas_login WHERE ultima_tentativa < NOW() - INTERVAL '1 day'");
        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor, banco e schema conectados na porta ${PORT}`);
        });
    } catch (error) {
        console.error('A API não foi iniciada porque banco/schema falhou:', error);
        await db.close().catch(() => undefined);
        process.exit(1);
    }
}

void iniciar();

const cleanupTimer = setInterval(() => {
    UsuarioModel.expurgarContasVencidas().catch((error) => console.error('Falha ao excluir contas vencidas:', error));
    db.query("DELETE FROM tentativas_login WHERE ultima_tentativa < NOW() - INTERVAL '1 day'").catch(error => console.error('Falha ao limpar tentativas de login antigas:', error));
}, 6 * 60 * 60 * 1000);
cleanupTimer.unref();

const encerrar = (signal) => {
    console.log(`${signal} recebido. Encerrando servidor...`);
    if (!server) return db.close().finally(() => process.exit(0));
    server.close(async () => {
        await db.close();
        process.exit(0);
    });
};

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
