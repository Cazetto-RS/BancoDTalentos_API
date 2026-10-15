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
        codigo,
        request_id: res.req?.requestId
    });
};

const criado = (res, mensagem, dados = null) => sucesso(res, 201, mensagem, dados);
const semConteudo = (res) => res.status(204).send();

const erro400 = (res, mensagem) => {
    return res.status(400).json({
        sucesso: false,
        mensagem,
        codigo: 'BAD_REQUEST',
        request_id: res.req?.requestId
    });
};


const erro401 = (res, mensagem = 'Não autenticado.') => {
    return res.status(401).json({
        sucesso: false,
        mensagem,
        codigo: 'UNAUTHORIZED',
        request_id: res.req?.requestId
    });
};


const erro403 = (res, mensagem = 'Acesso negado.') => {
    return res.status(403).json({
        sucesso: false,
        mensagem,
        codigo: 'FORBIDDEN',
        request_id: res.req?.requestId
    });
};


const erro404 = (res, mensagem) => {
    return res.status(404).json({
        sucesso: false,
        mensagem,
        codigo: 'NOT_FOUND',
        request_id: res.req?.requestId
    });
};

const erro409 = (res, mensagem) => res.status(409).json({
    sucesso: false,
    mensagem,
    codigo: 'CONFLICT',
    request_id: res.req?.requestId
});


const erro500 = (res, mensagem = 'Internal error on server') => {
    return res.status(500).json({
        sucesso: false,
        mensagem,
        codigo: 'INTERNAL_ERROR',
        request_id: res.req?.requestId
    });
};

module.exports = { sucesso, criado, semConteudo, erro, erro400, erro401, erro403, erro404, erro409, erro500 };
