const env = require('../config/env');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
    }
});

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

async function enviarCodigo({ email, nome, codigo, finalidade }) {
    const verificacao = finalidade === 'verificar_email';
    const assunto = verificacao ? 'Confirme seu e-mail' : 'Código para redefinir sua senha';
    const titulo = verificacao ? 'Confirme seu cadastro' : 'Redefinição de senha';
    const descricao = verificacao
        ? 'Use o código abaixo para confirmar seu e-mail e concluir o cadastro.'
        : 'Use o código abaixo para criar uma nova senha.';

    await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: assunto,
        html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#1c2430"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:12px"><p style="margin:0 0 8px;color:#6b7280">Banco de Talentos</p><h1 style="font-size:24px;margin:0 0 18px">${titulo}</h1><p>Olá, ${escapeHtml(nome || 'candidato')}.</p><p>${descricao}</p><div style="margin:28px 0;padding:18px;text-align:center;background:#eef6ff;border-radius:10px;font-size:32px;font-weight:700;letter-spacing:10px;color:#1267a8">${codigo}</div><p style="font-size:14px;color:#6b7280">Este código expira em ${env.EMAIL_CODE_TTL_MINUTES} minutos. Se você não solicitou esta mensagem, pode ignorá-la.</p></div></body></html>`,
        text: `${titulo}\n\nOlá, ${nome || 'candidato'}.\n${descricao}\n\nCódigo: ${codigo}\n\nEle expira em ${env.EMAIL_CODE_TTL_MINUTES} minutos.`
    });
}

async function verificarConexao() {
    return transporter.verify();
}

module.exports = { enviarCodigo, verificarConexao };
