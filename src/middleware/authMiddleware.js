const jwt = require('jsonwebtoken');
const db = require('../config/database');
const env = require('../config/env')
const { erro401, erro403 } = require('../utils/apiResponse');

const autenticar = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return erro401(res, 'Token de acesso não fornecido.');
        }

        const token = authHeader.split(' ')[1];
        const decodificar = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });

        // 💡 AJUSTADO: Além de buscar a sessão, garante que ela foi criada nos últimos 30 dias
        const queryText = `
            SELECT * FROM sessoes 
            WHERE usuario_id = $1 AND token = $2 
            AND criado_em >= NOW() - ($3 * INTERVAL '1 day');
        `;
        const { rows } = await db.query(queryText, [decodificar.id, token, env.SESSION_TTL_DAYS]);

        if (rows.length === 0) {
            return erro401(res, 'Sessão inválida ou expirada. Faça login novamente.');
        }

        req.usuario = decodificar;
        return next();
    } catch {
        return erro401(res, 'Token inválido ou expirado.');
    }
};

const verificarPermissao = (req, res, next) => {
    if (req.usuario && (req.usuario.cargo === 'admin' || req.usuario.cargo === 'rh')){
        return next();
    } else {
        return erro403(res, 'Recurso exclusivo para funcionários.');
    }
}

const verificarAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.cargo === 'admin'){
        return next();
    } else {
        return erro403(res, 'Recurso exclusivo para administradores.');
    }
};

const verificarCandidato = (req, res, next) => {
    if (req.usuario?.cargo === 'candidato') return next();
    return erro403(res, 'Recurso exclusivo para candidatos.');
};

module.exports = { autenticar, verificarAdmin, verificarPermissao, verificarCandidato };
