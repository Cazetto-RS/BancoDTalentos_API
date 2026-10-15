const { verificarConexao } = require('../services/emailService');

verificarConexao()
    .then(() => {
        console.log('Conexão SMTP válida.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Falha na conexão SMTP:', error.message);
        process.exit(1);
    });
