const crypto = require('node:crypto');
const db = require('../config/database');
const env = require('../config/env');

// Não persiste o e-mail digitado: o índice da tentativa é uma HMAC não reversível.
// O controle é compartilhado entre instâncias da API via PostgreSQL.
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

function chaveLogin(email) {
    return crypto.createHmac('sha256', env.JWT_SECRET)
        .update(String(email).trim().toLowerCase())
        .digest('hex');
}

async function consultar(email) {
    const { rows } = await db.query(`
        SELECT tentativas, bloqueado_ate
          FROM tentativas_login
         WHERE chave = $1
    `, [chaveLogin(email)]);
    const fim = rows[0]?.bloqueado_ate ? new Date(rows[0].bloqueado_ate).getTime() : 0;
    const retryAfterSeconds = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
    return { bloqueado: retryAfterSeconds > 0, retryAfterSeconds };
}

async function registrarFalha(email) {
    // UPSERT atômico: duas requisições simultâneas não perdem contagens.
    const { rows } = await db.query(`
        INSERT INTO tentativas_login (chave, tentativas, inicio_janela, ultima_tentativa)
        VALUES ($1, 1, NOW(), NOW())
        ON CONFLICT (chave) DO UPDATE SET
            tentativas = CASE
                WHEN tentativas_login.bloqueado_ate > NOW() THEN tentativas_login.tentativas
                WHEN tentativas_login.inicio_janela <= NOW() - INTERVAL '15 minutes' THEN 1
                ELSE LEAST(tentativas_login.tentativas + 1, 5)
            END,
            inicio_janela = CASE
                WHEN tentativas_login.bloqueado_ate > NOW() THEN tentativas_login.inicio_janela
                WHEN tentativas_login.inicio_janela <= NOW() - INTERVAL '15 minutes' THEN NOW()
                ELSE tentativas_login.inicio_janela
            END,
            bloqueado_ate = CASE
                WHEN tentativas_login.bloqueado_ate > NOW() THEN tentativas_login.bloqueado_ate
                WHEN tentativas_login.inicio_janela <= NOW() - INTERVAL '15 minutes' THEN NULL
                WHEN tentativas_login.tentativas + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
                ELSE NULL
            END,
            ultima_tentativa = NOW()
        RETURNING bloqueado_ate
    `, [chaveLogin(email)]);
    const fim = rows[0]?.bloqueado_ate ? new Date(rows[0].bloqueado_ate).getTime() : 0;
    return { bloqueado: fim > Date.now(), retryAfterSeconds: Math.max(0, Math.ceil((fim - Date.now()) / 1000)) };
}

async function limpar(email) {
    await db.query('DELETE FROM tentativas_login WHERE chave = $1', [chaveLogin(email)]);
}

module.exports = { consultar, registrarFalha, limpar, chaveLogin, MAX_ATTEMPTS, WINDOW_MINUTES, LOCK_MINUTES };
