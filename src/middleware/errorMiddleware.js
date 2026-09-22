const errorMiddleware = (erro, req, res, next) => {
    if (res.headersSent) return next(erro);

    const status = erro.statusCode || erro.status || 500;
    const codigo = erro.code || 'INTERNAL_ERROR';

    if (status >= 500) console.error(erro);

    return res.status(status).json({
        sucesso: false,
        mensagem: status >= 500 ? 'Erro interno no servidor.' : erro.message,
        codigo
    });
};

module.exports = errorMiddleware;
