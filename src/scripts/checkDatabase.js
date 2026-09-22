const dns = require('node:dns/promises');
const net = require('node:net');
const { Client } = require('pg');
const env = require('../config/env');

const url = new URL(env.DATABASE_URL);
const sslMode = url.searchParams.get('sslmode');
if (['prefer', 'require', 'verify-ca'].includes(sslMode)) url.searchParams.set('sslmode', 'verify-full');

const host = url.hostname;
const port = Number(url.port || 5432);

const testarTcp = () => new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port, timeout: 15000 });
    socket.once('connect', () => { socket.destroy(); resolve(); });
    socket.once('timeout', () => { socket.destroy(); reject(new Error('TCP_TIMEOUT')); });
    socket.once('error', reject);
});

const executar = async () => {
    console.log(`1/3 DNS: resolvendo ${host}...`);
    const enderecos = await dns.lookup(host, { all: true });
    console.log(`    OK: ${enderecos.map(({ address, family }) => `${address} (IPv${family})`).join(', ')}`);

    console.log(`2/3 TCP: testando ${host}:${port}...`);
    await testarTcp();
    console.log('    OK: porta PostgreSQL acessível.');

    console.log('3/3 PostgreSQL/TLS: autenticando e executando SELECT 1...');
    const client = new Client({
        connectionString: url.toString(),
        connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
        keepAlive: true
    });

    try {
        await client.connect();
        const { rows } = await client.query('SELECT current_database() AS banco, current_user AS usuario, NOW() AS agora');
        console.log('    OK:', rows[0]);
        console.log('\nCONEXÃO COM O NEON FUNCIONANDO.');
    } finally {
        await client.end().catch(() => {});
    }
};

executar().catch((error) => {
    console.error('\nFALHA NO DIAGNÓSTICO.');
    if (error.message === 'TCP_TIMEOUT') {
        console.error('A rede não alcançou a porta 5432 do Neon. Teste outra rede ou uma conexão pooled do painel Neon.');
    } else if (['ENOTFOUND', 'EAI_AGAIN'].includes(error.code)) {
        console.error('Falha de DNS. O hostname da DATABASE_URL está incorreto ou não pôde ser resolvido.');
    } else if (['ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH'].includes(error.code)) {
        console.error(`Falha de rede (${error.code}). Firewall, VPN, proxy ou rede podem estar bloqueando PostgreSQL.`);
    } else if (error.code === '28P01') {
        console.error('Usuário ou senha inválidos. Copie uma nova connection string no painel do Neon.');
    } else if (error.code === '3D000') {
        console.error('O banco informado na URL não existe.');
    } else {
        console.error(`${error.code || 'ERRO'}: ${error.message}`);
    }
    process.exitCode = 1;
});
