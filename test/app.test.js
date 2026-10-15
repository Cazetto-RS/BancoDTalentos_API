process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:5173/';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const db = require('../src/config/database');

test.after(async () => db.close());

test('GET / responde no padrão da API', async () => {
    const response = await request(app).get('/').expect(200);
    assert.equal(response.body.sucesso, true);
    assert.equal(response.body.dados.status, 'ok');
    assert.equal(response.body.dados.versao, 'email-verification-v3');
});

test('rota inexistente responde 404 padronizado', async () => {
    const response = await request(app).get('/nao-existe').expect(404);
    assert.equal(response.body.sucesso, false);
    assert.equal(response.body.codigo, 'ROUTE_NOT_FOUND');
});

test('cadastro inválido retorna detalhes sem acessar o banco', async () => {
    const response = await request(app)
        .post('/usuarios/registrar')
        .send({ nome_completo: '', email: 'invalido', senha: '123' })
        .expect(400);

    assert.equal(response.body.codigo, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(response.body.erros));
});

test('confirmação rejeita código fora do padrão sem acessar o banco', async () => {
    const response = await request(app)
        .post('/usuarios/verificar-email')
        .send({ email: 'candidato@example.com', codigo: '123' })
        .expect(400);
    assert.equal(response.body.codigo, 'VALIDATION_ERROR');
});

test('redefinição exige senha segura e código de seis dígitos', async () => {
    const response = await request(app)
        .post('/usuarios/redefinir-senha')
        .send({ email: 'candidato@example.com', codigo: '123456', nova_senha: 'curta' })
        .expect(400);
    assert.equal(response.body.codigo, 'VALIDATION_ERROR');
});

test('rota protegida rejeita requisição sem token', async () => {
    const response = await request(app).get('/candidatos/meu-perfil').expect(401);
    assert.equal(response.body.codigo, 'UNAUTHORIZED');
    assert.ok(response.body.request_id);
    assert.equal(response.headers['x-request-id'], response.body.request_id);
});

test('notificações rejeitam requisição sem token', async () => {
    const response = await request(app).get('/notificacoes').expect(401);
    assert.equal(response.body.sucesso, false);
});

test('upload rejeita requisição sem token', async () => {
    const response = await request(app).post('/uploads/foto').expect(401);
    assert.equal(response.body.codigo, 'UNAUTHORIZED');
});

test('CORS aceita origem configurada', async () => {
    const response = await request(app).get('/').set('Origin', 'http://localhost:5173').expect(200);
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
});

test('CORS rejeita origem desconhecida no padrão de erro', async () => {
    const response = await request(app).get('/').set('Origin', 'https://origem-invalida.example').expect(403);
    assert.equal(response.body.codigo, 'CORS_FORBIDDEN');
});
