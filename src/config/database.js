const { Pool } = require('pg');
const dns = require('node:dns');
const env = require('./env')

// Em algumas redes Windows o DNS entrega IPv6 primeiro, mesmo sem uma rota IPv6 funcional.
// Priorizar IPv4 evita timeouts falsos sem desativar IPv6 quando ele for a única opção.
dns.setDefaultResultOrder('ipv4first');

const databaseUrl = new URL(env.DATABASE_URL);
const sslMode = databaseUrl.searchParams.get('sslmode');

// Mantém a validação forte já usada pelo pg atual e evita a mudança semântica anunciada para o pg 9.
if (['prefer', 'require', 'verify-ca'].includes(sslMode)) {
    databaseUrl.searchParams.set('sslmode', 'verify-full');
}

const pool = new Pool ({
    connectionString: databaseUrl.toString(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: env.NODE_ENV === 'test',
});

pool.on('error', (error) => console.error('Erro inesperado no pool PostgreSQL:', error));

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    close: () => pool.end()
}
