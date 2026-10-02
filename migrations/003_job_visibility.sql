BEGIN;

ALTER TABLE vagas ADD COLUMN IF NOT EXISTS visibilidade VARCHAR(10) NOT NULL DEFAULT 'publica';
ALTER TABLE vagas DROP CONSTRAINT IF EXISTS vagas_visibilidade_check;
ALTER TABLE vagas ADD CONSTRAINT vagas_visibilidade_check CHECK (visibilidade IN ('publica', 'privada'));
CREATE INDEX IF NOT EXISTS idx_vagas_publicacao ON vagas (status, visibilidade, criado_em DESC);

COMMIT;
