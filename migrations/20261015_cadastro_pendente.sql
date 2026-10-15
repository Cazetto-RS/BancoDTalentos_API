BEGIN;

CREATE TABLE IF NOT EXISTS cadastros_pendentes (
    email VARCHAR(120) PRIMARY KEY,
    nome_completo VARCHAR(120) NOT NULL,
    senha_hash TEXT NOT NULL,
    expira_em TIMESTAMPTZ NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE codigos_email
    ALTER COLUMN usuario_id DROP NOT NULL;

-- Remove somente contas incompletas geradas pela versão anterior do fluxo.
DELETE FROM usuarios
WHERE cargo = 'candidato' AND email_verificado_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_expiracao
    ON cadastros_pendentes (expira_em);

COMMIT;
