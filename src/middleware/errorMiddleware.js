const errorMiddleware = (erro, req, res, next) => {
    if (res.headersSent) return next(erro);

    const fileTooLarge = erro.code === 'LIMIT_FILE_SIZE';
    const status = fileTooLarge ? 413 : (erro.statusCode || erro.status || 500);
    const codigo = fileTooLarge ? 'FILE_TOO_LARGE' : (erro.code || 'INTERNAL_ERROR');

    if (status >= 500) console.error(erro);

    return res.status(status).json({
        sucesso: false,
        mensagem: fileTooLarge ? 'O arquivo excede o limite de 5 MB.' : (status >= 500 ? 'Erro interno no servidor.' : erro.message),
        codigo
    });
};

module.exports = errorMiddleware;
