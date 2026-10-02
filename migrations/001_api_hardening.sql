BEGIN;

-- Campos exibidos e coletados pelo front-end.
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS portfolio_url text;
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS curriculo_url text;
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS cargo_desejado varchar(120);

-- Área principal da vaga.
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS area_interesse_id integer;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vagas_area_interesse_id_fkey') THEN
        ALTER TABLE vagas
            ADD CONSTRAINT vagas_area_interesse_id_fkey
            FOREIGN KEY (area_interesse_id) REFERENCES areas_interesse(id) ON DELETE SET NULL;
    END IF;
END $$;

-- O front-end prevê estágio; banco e API passam a aceitar o mesmo contrato.
ALTER TABLE vagas DROP CONSTRAINT IF EXISTS vagas_tipo_contrato_check;
ALTER TABLE vagas ADD CONSTRAINT vagas_tipo_contrato_check
    CHECK (tipo_contrato IN ('CLT', 'PJ', 'Estágio'));

ALTER TABLE candidaturas DROP CONSTRAINT IF EXISTS candidaturas_preferencia_contrato_check;
ALTER TABLE candidaturas ADD CONSTRAINT candidaturas_preferencia_contrato_check
    CHECK (preferencia_contrato IN ('CLT', 'PJ', 'Estágio'));

ALTER TABLE vagas DROP CONSTRAINT IF EXISTS vagas_salarios_validos_check;
ALTER TABLE vagas ADD CONSTRAINT vagas_salarios_validos_check CHECK (
    (salario_min IS NULL OR salario_min >= 0)
    AND (salario_max IS NULL OR salario_max >= 0)
    AND (salario_min IS NULL OR salario_max IS NULL OR salario_min <= salario_max)
);

ALTER TABLE candidaturas DROP CONSTRAINT IF EXISTS candidaturas_pretensao_valida_check;
ALTER TABLE candidaturas ADD CONSTRAINT candidaturas_pretensao_valida_check
    CHECK (pretensao_salarial IS NULL OR pretensao_salarial >= 0);

ALTER TABLE experiencias DROP CONSTRAINT IF EXISTS experiencias_datas_validas_check;
ALTER TABLE experiencias ADD CONSTRAINT experiencias_datas_validas_check
    CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio);

ALTER TABLE formacoes DROP CONSTRAINT IF EXISTS formacoes_datas_validas_check;
ALTER TABLE formacoes ADD CONSTRAINT formacoes_datas_validas_check
    CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio);

-- Índices usados por login, sessão, listagens e filtros administrativos.
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_lower_key ON usuarios (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS sessoes_token_key ON sessoes (token);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_criado ON sessoes (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_experiencias_candidato ON experiencias (candidato_id);
CREATE INDEX IF NOT EXISTS idx_formacoes_candidato ON formacoes (candidato_id);
CREATE INDEX IF NOT EXISTS idx_interesses_candidato_interesse ON interesses_candidato (interesse_id);
CREATE INDEX IF NOT EXISTS idx_vagas_status_criado ON vagas (status, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_vagas_area ON vagas (area_interesse_id);

COMMIT;
