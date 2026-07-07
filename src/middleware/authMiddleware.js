const jwt = require('jsonwebtoken');
const db = require('../config/database');

const autenticar = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ erro: 'Acesso negado. Token incorreto ou não fornecido.' });
        }

        const token = authHeader.split(' ')[1];
        const decodificar = jwt.verify(token, process.env.JWT_SECRET);

        // 💡 AJUSTADO: Além de buscar a sessão, garante que ela foi criada nos últimos 30 dias
        const queryText = `
            SELECT * FROM sessoes 
            WHERE usuario_id = $1 AND token = $2 
            AND criado_em >= NOW() - INTERVAL '30 days';
        `;
        const { rows } = await db.query(queryText, [decodificar.id, token]);

        if (rows.length === 0) {
            return res.status(401).json({ erro: 'Sessão inválida, expirada ou substituída. Faça login novamente.' });
        }

        req.usuario = decodificar;
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

const verificarPermissao = (req, res, next) => {
    if (req.usuario && req.usuario.cargo === 'admin' || req.usuario.cargo === 'rh'){
        next();
    } else {
        return res.status(403).json({erro: 'Acesso negado. Recurso exclusivo para funcionários.'})
    }
}

const verificarAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.cargo === 'admin'){
        next();
    } else {
        return res.status(403).json({erro: 'Acesso negado. Recurso exclusivo para Administradores.'})
    }
};

module.exports = {autenticar, verificarAdmin, verificarPermissao};