const db = require('./database');

async function ensureEmailSchema() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query("SELECT pg_advisory_xact_lock(hashtext('banco-talentos-email-schema-v2'))");

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                nome VARCHAR(160) PRIMARY KEY,
                executada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        const coluna = await client.query(`
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'usuarios'
              AND column_name = 'email_verificado_em'
        `);
        if (!coluna.rows.length) {
            await client.query('ALTER TABLE usuarios ADD COLUMN email_verificado_em TIMESTAMPTZ');
            await client.query('UPDATE usuarios SET email_verificado_em = NOW()');
        }

        await client.query(`
            CREATE TABLE IF NOT EXISTS codigos_email (
                id BIGSERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                email VARCHAR(120) NOT NULL,
                codigo_hash CHAR(64) NOT NULL,
                finalidade VARCHAR(30) NOT NULL CHECK (finalidade IN ('verificar_email', 'redefinir_senha')),
                tentativas INTEGER NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
                expira_em TIMESTAMPTZ NOT NULL,
                usado_em TIMESTAMPTZ,
                criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await client.query('ALTER TABLE codigos_email ALTER COLUMN usuario_id DROP NOT NULL');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_codigos_email_busca ON codigos_email (LOWER(email), finalidade, criado_em DESC)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_codigos_email_limpeza ON codigos_email (expira_em)`);

        await client.query(`
            CREATE TABLE IF NOT EXISTS cadastros_pendentes (
                email VARCHAR(120) PRIMARY KEY,
                nome_completo VARCHAR(120) NOT NULL,
                senha_hash TEXT NOT NULL,
                expira_em TIMESTAMPTZ NOT NULL,
                criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_expiracao ON cadastros_pendentes (expira_em)`);

        const aplicada = await client.query(
            "SELECT 1 FROM schema_migrations WHERE nome = 'cadastro_pendente_v2'"
        );
        if (!aplicada.rows.length) {
            await client.query("DELETE FROM usuarios WHERE cargo = 'candidato' AND email_verificado_em IS NULL");
            await client.query("INSERT INTO schema_migrations (nome) VALUES ('cadastro_pendente_v2')");
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = ensureEmailSchema;
