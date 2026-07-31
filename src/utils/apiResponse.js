const sucesso = (res, status, mensagem, dados = null) => {
    return res.status(status).json({
        sucesso: true,
        mensagem,
        dados
    });
};

const erro = (res, status, mensagem, codigo = null) => {
    return res.status(status).json({
        sucesso: false,
        mensagem,
        codigo
    });
};

const erro400 = (res, mensagem) => {
    return res.status(400).json({
        sucesso: false,
        mensagem,
        codigo: 'BAD_REQUEST'
    });
};


const erro401 = (res, mensagem = 'Unauthorizad') => {
    return res.status(401).json({
        sucesso: false,
        mensagem,
        codigo: 'UNAUTHORIZED'
    });
};


const erro403 = (res, mensagem = 'Acess Denied') => {
    return res.status(403).json({
        sucesso: false,
        mensagem,
        codigo: 'FORBIDDEN'
    });
};


const erro404 = (res, mensagem) => {
    return res.status(404).json({
        sucesso: false,
        mensagem,
        codigo: 'NOT_FOUND'
    });
};


const erro500 = (res, mensagem = 'Internal error on server') => {
    return res.status(500).json({
        sucesso: false,
        mensagem,
        codigo: 'INTERNAL_ERROR'
    });
};

module.exports = {sucesso, erro, erro400, erro401, erro403, erro404, erro500};