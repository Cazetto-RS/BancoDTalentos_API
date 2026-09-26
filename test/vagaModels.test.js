process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:5173';

const test = require('node:test');
const assert = require('node:assert/strict');
const vagaModels = require('../src/models/vagaModels');
const db = require('../src/config/database');

test.after(async () => db.close());

test('listagem de vagas mantém o agregado e fallback no mesmo tipo jsonb', async () => {
    let receivedSql = '';
    const executor = {
        query: async (sql) => {
            receivedSql = sql;
            return { rows: [] };
        },
    };

    const rows = await vagaModels.buscarTodos({ executor });

    assert.deepEqual(rows, []);
    assert.match(receivedSql, /JSONB_AGG/);
    assert.match(receivedSql, /'\[\]'::jsonb/);
    assert.doesNotMatch(receivedSql, /'\[\]'::json(?!b)/);
});

test('criação de vaga persiste ícone e cor escolhidos', async () => {
    let captured;
    const executor = { query: async (text, values) => { captured = { text, values }; return { rows: [{ id: 1 }] }; } };
    await vagaModels.criarVaga({ titulo:'Vaga teste', icone:'design', cor:'#FF2685' }, executor);
    assert.match(captured.text, /icone, cor/);
    assert.deepEqual(captured.values.slice(-2), ['design', '#FF2685']);
});
