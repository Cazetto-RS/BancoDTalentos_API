const errorMiddleware = (erro, req, res, next) => {
    console.error(erro);

    return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno no servidor.",
        codigo: "INTERNAL_ERROR"
    });
};

module.exports = errorMiddleware;