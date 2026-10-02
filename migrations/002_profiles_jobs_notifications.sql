BEGIN;

ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS logradouro varchar(160);
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS bairro varchar(120);
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS icone varchar(40) NOT NULL DEFAULT 'code';
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS cor varchar(7) NOT NULL DEFAULT '#169CF9';

ALTER TABLE vagas DROP CONSTRAINT IF EXISTS vagas_cor_hex_check;
ALTER TABLE vagas ADD CONSTRAINT vagas_cor_hex_check CHECK (cor ~ '^#[0-9A-Fa-f]{6}$');

CREATE TABLE IF NOT EXISTS notificacoes (
    id bigserial PRIMARY KEY,
    usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo varchar(40) NOT NULL,
    titulo varchar(160) NOT NULL,
    mensagem text NOT NULL,
    dados jsonb NOT NULL DEFAULT '{}'::jsonb,
    lida boolean NOT NULL DEFAULT false,
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_data
    ON notificacoes (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_nao_lida
    ON notificacoes (usuario_id, lida) WHERE lida = false;

COMMIT;
