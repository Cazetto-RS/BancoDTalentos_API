// Teste real de envio; somente para endereços controlados pelo desenvolvedor.
const { enviarCodigo } = require('../services/emailService');
const destinatario = process.env.TEST_EMAIL || process.argv[2];
if (!destinatario) {
    console.error('Configure TEST_EMAIL no .env ou execute: npm run email:check -- seu@email.com');
    process.exit(1);
}
enviarCodigo({ email: destinatario, nome: 'Teste Banco de Talentos', codigo: '123456', finalidade: 'verificar_email' })
    .then((resultado) => console.log('Brevo aceitou o envio. Identificador:', resultado.messageId || 'não informado'))
    .catch((error) => { console.error('Falha ao enviar pela Brevo:', error.message); process.exitCode = 1; });
