const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

const corsOptions = require('./src/config/cors');
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { sucesso: false, mensagem: 'Muitas tentativas. Tente novamente mais tarde.', codigo: 'RATE_LIMITED' }
});

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const candidatoRoutes = require('./src/routes/candidatosRoutes');
const historicoRoutes = require('./src/routes/historicoRoutes');
const vagasRoutes = require('./src/routes/vagasRoutes');
const candidaturasRoutes = require('./src/routes/candidaturaRoutes');
const habilidadesRoutes = require('./src/routes/habilidadesRoutes');
const habilidadesCandidatoRoutes = require('./src/routes/habilidadesCandidatosRoutes');
const areasInteresseRoutes = require('./src/routes/areasInteressesRoutes');
const interesseCandidatoRoutes = require('./src/routes/interessesCandidatosRoutes');
const notificacaoRoutes = require('./src/routes/notificacaoRoutes');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const notFoundMiddleware = require('./src/middleware/notFoundMiddleware');

app.use('/usuarios/login', authLimiter);
app.use('/usuarios/registrar', authLimiter);
app.use('/usuarios', usuarioRoutes);
app.use('/candidatos', candidatoRoutes);
app.use('/historico', historicoRoutes);
app.use('/vagas', vagasRoutes);
app.use('/candidaturas', candidaturasRoutes);
app.use('/habilidades', habilidadesRoutes);
app.use('/habilidades-candidatos', habilidadesCandidatoRoutes);
app.use('/areas-interesse', areasInteresseRoutes);
app.use('/interesses-candidato', interesseCandidatoRoutes);
app.use('/notificacoes', notificacaoRoutes);
// Alias legado, preservado para não quebrar clientes existentes.
app.use('/interesse-candidato', interesseCandidatoRoutes);

app.get('/', (req, res) => res.json({
    sucesso: true,
    mensagem: 'API do Banco de Talentos em execução.',
    dados: { status: 'ok' }
}));

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
