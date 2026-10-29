const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
const env = require('../src/config/env');
env.BREVO_API_KEY = 'chave-teste';
env.EMAIL_FROM = 'sender@example.com';
env.EMAIL_FROM_NAME = 'Banco de Talentos';
const { enviarCodigo } = require('../src/services/emailService');

test('Brevo recebe payload de verificação por HTTPS', async () => {
    const original = global.fetch;
    let body;
    global.fetch = async (url, options) => {
        assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
        assert.equal(options.method, 'POST');
        assert.equal(options.headers['api-key'], 'chave-teste');
        body = JSON.parse(options.body);
        return { ok: true, json: async () => ({ messageId: 'test-id' }) };
    };
    try {
        const result = await enviarCodigo({ email: 'dest@example.com', nome: '<Pessoa>', codigo: '012345', finalidade: 'verificar_email' });
        assert.equal(result.messageId, 'test-id');
        assert.equal(body.sender.email, 'sender@example.com');
        assert.equal(body.to[0].email, 'dest@example.com');
        assert.match(body.htmlContent, /&lt;Pessoa&gt;/);
        assert.doesNotMatch(body.htmlContent, /Olá, <Pessoa>/);
        assert.match(body.textContent, /012345/);
    } finally { global.fetch = original; }
});

test('Brevo com resposta HTTP inválida sinaliza EMAIL_UNAVAILABLE', async () => {
    const original = global.fetch;
    global.fetch = async () => ({ ok: false, status: 401 });
    try {
        await assert.rejects(
            enviarCodigo({ email: 'dest@example.com', codigo: '123456', finalidade: 'redefinir_senha' }),
            (error) => error.code === 'EMAIL_UNAVAILABLE' && error.statusProvedor === 401
        );
    } finally { global.fetch = original; }
});

test('Finalidade desconhecida não dispara envio', async () => {
    await assert.rejects(enviarCodigo({ email: 'x@example.com', codigo: '123456', finalidade: 'outra' }), /Finalidade/);
});
