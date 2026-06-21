const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao rodar o banco', err.stack);
    } else {
        console.log('Banco iniciado, conectado e rodando com sucesso', res.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
}