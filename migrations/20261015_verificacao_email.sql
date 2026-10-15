BEGIN;

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS email_verificado_em TIMESTAMPTZ;

-- As contas que já existiam antes desta atualização continuam válidas.
UPDATE usuarios
SET email_verificado_em = COALESCE(email_verificado_em, NOW());

CREATE TABLE IF NOT EXISTS codigos_email (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    email VARCHAR(120) NOT NULL,
    codigo_hash CHAR(64) NOT NULL,
    finalidade VARCHAR(30) NOT NULL CHECK (finalidade IN ('verificar_email', 'redefinir_senha')),
    tentativas INTEGER NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
    expira_em TIMESTAMPTZ NOT NULL,
    usado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codigos_email_busca
    ON codigos_email (LOWER(email), finalidade, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_codigos_email_limpeza
    ON codigos_email (expira_em);

COMMIT;
