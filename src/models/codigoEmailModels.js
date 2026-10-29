const db = require('../config/database');

const CodigoEmailModel = {
    substituir: async ({ usuario_id, email, codigo_hash, finalidade, expira_em }) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                `UPDATE codigos_email SET usado_em = NOW()
                 WHERE LOWER(email) = LOWER($1) AND finalidade = $2 AND usado_em IS NULL`,
                [email, finalidade]
            );
            const { rows } = await client.query(
                `INSERT INTO codigos_email (usuario_id, email, codigo_hash, finalidade, expira_em)
                 VALUES ($1, LOWER($2), $3, $4, $5)
                 RETURNING id, criado_em`,
                [usuario_id, email, codigo_hash, finalidade, expira_em]
            );
            await client.query('COMMIT');
            return rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    invalidarSeAtivo: async (id) => {
        await db.query(
            'UPDATE codigos_email SET usado_em = NOW() WHERE id = $1 AND usado_em IS NULL',
            [id]
        );
    },

    buscarAtivo: async (email, finalidade) => {
        const { rows } = await db.query(
            `SELECT * FROM codigos_email
             WHERE LOWER(email) = LOWER($1) AND finalidade = $2 AND usado_em IS NULL
             ORDER BY criado_em DESC LIMIT 1`,
            [email, finalidade]
        );
        return rows[0];
    },

    registrarFalha: async (id) => {
        await db.query('UPDATE codigos_email SET tentativas = tentativas + 1 WHERE id = $1', [id]);
    },

    marcarUsado: async (id) => {
        const { rows } = await db.query(
            'UPDATE codigos_email SET usado_em = NOW() WHERE id = $1 AND usado_em IS NULL RETURNING id',
            [id]
        );
        return rows[0];
    },

    podeReenviar: async (email, finalidade, segundos) => {
        const { rows } = await db.query(
            `SELECT NOT EXISTS (
                SELECT 1 FROM codigos_email
                WHERE LOWER(email) = LOWER($1) AND finalidade = $2
                  AND usado_em IS NULL
                  AND criado_em > NOW() - ($3 * INTERVAL '1 second')
            ) AS permitido`,
            [email, finalidade, segundos]
        );
        return rows[0]?.permitido === true;
    }
};

module.exports = CodigoEmailModel;
