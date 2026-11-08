-- Criado automaticamente por ensureEmailSchema em inicializações normais.
CREATE TABLE IF NOT EXISTS equipe_pendente (
    email VARCHAR(120) PRIMARY KEY,
    nome_completo VARCHAR(120) NOT NULL,
    senha_hash TEXT NOT NULL,
    cargo VARCHAR(20) NOT NULL CHECK (cargo IN ('rh', 'admin')),
    criado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    expira_em TIMESTAMPTZ NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipe_pendente_expira ON equipe_pendente (expira_em);
