-- Controle de tentativas de autenticação: não armazena e-mails nem senhas.
CREATE TABLE IF NOT EXISTS tentativas_login (
    chave VARCHAR(64) PRIMARY KEY,
    tentativas SMALLINT NOT NULL DEFAULT 0 CHECK (tentativas BETWEEN 0 AND 5),
    inicio_janela TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultima_tentativa TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    bloqueado_ate TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_tentativas_login_limpeza ON tentativas_login (ultima_tentativa);
