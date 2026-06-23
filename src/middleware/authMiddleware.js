const jwt = require('jsonwebtoken');
const db = require('../config/database');

const autenticar = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith ('Bearer ')) {
            return res.status(401).json({erro: 'Acesso negado. Token incorreto ou não fornecido.'})
        }

        const token = authHeader.split(' ')[1];

        const decodificar = jwt.verify(token, process.env.JWT_SECRET);

        const queryText = 'SELECT * FROM sessoes WHERE usuario_id = $1 AND token = $2';
        const { rows } = await db.query(queryText, [decodificar.id, token]);

        if (rows.length === 0){
            return res.status(401).json({erro: 'Sessão inválida ou expirada. Faça login e tente novamente.'})
        }

        req.usuario = decodificar;

        next();
    } catch (error) {
        return res.status(401).json({erro: 'Token inválido.'});
    }
};

const verificarAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.cargo === 'admin'){
        next();
    } else {
        return res.status(403).json({erro: 'Acesso negado. Recurso exclusivo para Administradores'})
    }
};

module.exports = {autenticar, verificarAdmin};