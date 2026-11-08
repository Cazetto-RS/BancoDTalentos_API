const db = require('../config/database');

const EquipePendenteModel = {
    async salvar({ nome_completo, email, senha_hash, cargo, criado_por }) {
        const { rows } = await db.query(`
            INSERT INTO equipe_pendente
                (nome_completo, email, senha_hash, cargo, criado_por, expira_em)
            VALUES ($1, LOWER($2), $3, $4, $5, NOW() + INTERVAL '24 hours')
            ON CONFLICT (email) DO UPDATE SET
                nome_completo = EXCLUDED.nome_completo,
                senha_hash = EXCLUDED.senha_hash,
                cargo = EXCLUDED.cargo,
                criado_por = EXCLUDED.criado_por,
                expira_em = EXCLUDED.expira_em,
                atualizado_em = NOW()
            RETURNING nome_completo, email, cargo, expira_em`,
            [nome_completo, email, senha_hash, cargo, criado_por]);
        return rows[0];
    },

    async buscar(email) {
        const { rows } = await db.query(`
            SELECT nome_completo, email, cargo, expira_em
            FROM equipe_pendente
            WHERE email = LOWER($1) AND expira_em > NOW()`, [email]);
        return rows[0];
    },

    async confirmar(email, codigoId) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const { rows: pendentes } = await client.query(`
                SELECT nome_completo, email, senha_hash, cargo
                FROM equipe_pendente
                WHERE email = LOWER($1) AND expira_em > NOW()
                FOR UPDATE`, [email]);
            const pendente = pendentes[0];
            if (!pendente) { await client.query('ROLLBACK'); return null; }
            const { rows: codigos } = await client.query(`
                UPDATE codigos_email SET usado_em = NOW()
                WHERE id = $1 AND email = LOWER($2) AND finalidade = 'verificar_equipe'
                  AND usado_em IS NULL AND expira_em > NOW()
                  AND tentativas < $3
                RETURNING id`, [codigoId, email, require('../config/env').EMAIL_CODE_MAX_ATTEMPTS]);
            if (!codigos.length) { await client.query('ROLLBACK'); return null; }
            const { rows } = await client.query(`
                INSERT INTO usuarios (nome_completo, email, senha_hash, cargo, email_verificado_em)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id, nome_completo, email, cargo, criado_em`,
                [pendente.nome_completo, pendente.email, pendente.senha_hash, pendente.cargo]);
            await client.query('DELETE FROM equipe_pendente WHERE email = LOWER($1)', [email]);
            await client.query('COMMIT');
            return rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally { client.release(); }
    }
};
module.exports = EquipePendenteModel;
