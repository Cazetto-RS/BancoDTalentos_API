const notFoundMiddleware = (req, res) => res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada.',
    codigo: 'ROUTE_NOT_FOUND'
});

module.exports = notFoundMiddleware;
