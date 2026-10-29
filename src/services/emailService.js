const env = require('../config/env');

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

function erroEmail(status) {
    const erro = new Error(status ? `Brevo recusou a mensagem (HTTP ${status}).` : 'Não foi possível contatar a Brevo.');
    erro.code = 'EMAIL_UNAVAILABLE';
    erro.statusProvedor = status;
    return erro;
}

async function enviarCodigo({ email, nome, codigo, finalidade }) {
    if (!['verificar_email', 'redefinir_senha'].includes(finalidade)) {
        throw new Error('Finalidade de e-mail inválida.');
    }
    const verificacao = finalidade === 'verificar_email';
    const assunto = verificacao ? 'Confirme seu e-mail' : 'Código para redefinir sua senha';
    const titulo = verificacao ? 'Confirme seu cadastro' : 'Redefinição de senha';
    const descricao = verificacao
        ? 'Use o código abaixo para confirmar seu e-mail e concluir o cadastro.'
        : 'Use o código abaixo para criar uma nova senha.';
    const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#1c2430"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:12px"><p style="margin:0 0 8px;color:#6b7280">Banco de Talentos</p><h1 style="font-size:24px;margin:0 0 18px">${titulo}</h1><p>Olá, ${escapeHtml(nome || 'candidato')}.</p><p>${descricao}</p><div style="margin:28px 0;padding:18px;text-align:center;background:#eef6ff;border-radius:10px;font-size:32px;font-weight:700;letter-spacing:10px;color:#1267a8">${escapeHtml(codigo)}</div><p style="font-size:14px;color:#6b7280">Este código expira em ${env.EMAIL_CODE_TTL_MINUTES} minutos. Se você não solicitou esta mensagem, pode ignorá-la.</p></div></body></html>`;
    const texto = `${titulo}\n\nOlá, ${nome || 'candidato'}.\n${descricao}\n\nCódigo: ${codigo}\n\nEle expira em ${env.EMAIL_CODE_TTL_MINUTES} minutos.`;
    let resposta;
    try {
        resposta = await fetch(BREVO_URL, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: env.EMAIL_FROM_NAME, email: env.EMAIL_FROM },
                to: [{ email }],
                subject: assunto,
                htmlContent: html,
                textContent: texto
            }),
            signal: AbortSignal.timeout(10000)
        });
    } catch (cause) {
        const falha = erroEmail();
        falha.cause = cause;
        throw falha;
    }
    if (!resposta.ok) throw erroEmail(resposta.status);
    try {
        return await resposta.json();
    } catch (cause) {
        const falha = erroEmail();
        falha.cause = cause;
        throw falha;
    }
}

module.exports = { enviarCodigo };
