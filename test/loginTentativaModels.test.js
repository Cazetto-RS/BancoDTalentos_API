process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://user:password@localhost:5432/test';
process.env.JWT_SECRET ||= 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS ||= 'http://localhost:5173';

const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/config/database');
const model = require('../src/models/loginTentativaModels');

test.after(async () => db.close());

test('chave da tentativa é HMAC e normaliza e-mail sem armazenar texto claro', () => {
    const chave = model.chaveLogin('  Pessoa@Exemplo.COM  ');
    assert.match(chave, /^[a-f0-9]{64}$/);
    assert.equal(chave, model.chaveLogin('pessoa@exemplo.com'));
    assert.notEqual(chave, model.chaveLogin('outra@exemplo.com'));
    assert.doesNotMatch(chave, /pessoa|exemplo/);
    assert.equal(model.MAX_ATTEMPTS, 5);
    assert.equal(model.LOCK_MINUTES, 15);
});

test('consulta bloqueio e calcula intervalo de espera sem expor identificador', async () => {
    const original = db.query;
    const now = Date.now();
    let parametros;
    db.query = async (sql, params) => {
        assert.match(sql, /FROM tentativas_login/);
        parametros = params;
        return { rows: [{ tentativas: 5, bloqueado_ate: new Date(now + 30000) }] };
    };
    try {
        const status = await model.consultar('pessoa@exemplo.com');
        assert.equal(status.bloqueado, true);
        assert.ok(status.retryAfterSeconds > 0 && status.retryAfterSeconds <= 30);
        assert.deepEqual(parametros, [model.chaveLogin('pessoa@exemplo.com')]);
    } finally { db.query = original; }
});

test('registrar falha usa UPSERT atômico com limite de cinco e limpeza pontual', async () => {
    const original = db.query;
    const sqls = [];
    db.query = async (sql, params) => {
        sqls.push(sql);
        assert.deepEqual(params, [model.chaveLogin('x@exemplo.com')]);
        return { rows: [{ bloqueado_ate: new Date(Date.now() + 900000) }] };
    };
    try {
        const status = await model.registrarFalha('x@exemplo.com');
        assert.equal(status.bloqueado, true);
        assert.match(sqls[0], /ON CONFLICT\s*\(chave\) DO UPDATE/i);
        assert.match(sqls[0], /LEAST\(tentativas_login\.tentativas \+ 1, 5\)/);
        assert.match(sqls[0], /INTERVAL '15 minutes'/);
        await model.limpar('x@exemplo.com');
        assert.match(sqls[1], /DELETE FROM tentativas_login/);
    } finally { db.query = original; }
});
