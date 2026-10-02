BEGIN;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS consentimento_talentos VARCHAR(30) NOT NULL DEFAULT 'somente_candidatura';
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_consentimento_talentos_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_consentimento_talentos_check CHECK (consentimento_talentos IN ('sempre', 'somente_candidatura'));
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS exclusao_agendada_em TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_usuarios_exclusao_agendada ON usuarios (exclusao_agendada_em) WHERE exclusao_agendada_em IS NOT NULL;

COMMIT;
