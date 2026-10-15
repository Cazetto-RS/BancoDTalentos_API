const db = require('../config/database');

const CadastroPendenteModel = {
    salvar: async ({ nome_completo, email, senha_hash }) => {
        const { rows } = await db.query(
            `INSERT INTO cadastros_pendentes (nome_completo, email, senha_hash, expira_em)
             VALUES ($1, LOWER($2), $3, NOW() + INTERVAL '24 hours')
             ON CONFLICT (email) DO UPDATE SET
                nome_completo = EXCLUDED.nome_completo,
                senha_hash = EXCLUDED.senha_hash,
                expira_em = EXCLUDED.expira_em,
                atualizado_em = NOW()
             RETURNING nome_completo, email, expira_em`,
            [nome_completo, email, senha_hash]
        );
        return rows[0];
    },

    buscar: async (email) => {
        await db.query('DELETE FROM cadastros_pendentes WHERE expira_em <= NOW()');
        const { rows } = await db.query(
            `SELECT nome_completo, email, senha_hash, expira_em
             FROM cadastros_pendentes
             WHERE LOWER(email) = LOWER($1) AND expira_em > NOW()`,
            [email]
        );
        return rows[0];
    },

    confirmar: async (email, codigoId) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const pendenteResult = await client.query(
                `SELECT nome_completo, email, senha_hash
                 FROM cadastros_pendentes
                 WHERE LOWER(email) = LOWER($1) AND expira_em > NOW()
                 FOR UPDATE`,
                [email]
            );
            const pendente = pendenteResult.rows[0];
            if (!pendente) {
                await client.query('ROLLBACK');
                return null;
            }
            const codigoResult = await client.query(
                `UPDATE codigos_email SET usado_em = NOW()
                 WHERE id = $1 AND usado_em IS NULL AND expira_em > NOW()
                 RETURNING id`,
                [codigoId]
            );
            if (!codigoResult.rows[0]) {
                await client.query('ROLLBACK');
                return null;
            }
            const usuarioResult = await client.query(
                `INSERT INTO usuarios (nome_completo, email, senha_hash, cargo, email_verificado_em)
                 VALUES ($1, LOWER($2), $3, 'candidato', NOW())
                 RETURNING id, nome_completo, email, cargo, criado_em, email_verificado_em`,
                [pendente.nome_completo, pendente.email, pendente.senha_hash]
            );
            const usuario = usuarioResult.rows[0];
            const candidatoResult = await client.query(
                'INSERT INTO candidatos (usuario_id) VALUES ($1) RETURNING id AS candidato_id',
                [usuario.id]
            );
            await client.query('DELETE FROM cadastros_pendentes WHERE LOWER(email) = LOWER($1)', [email]);
            await client.query('COMMIT');
            return { ...usuario, candidato_id: candidatoResult.rows[0].candidato_id };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = CadastroPendenteModel;
