const validar = (schema) => (req, res, next) => {
    const resultado = schema.safeParse({ body: req.body, params: req.params, query: req.query });

    if (!resultado.success) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Dados inválidos.',
            codigo: 'VALIDATION_ERROR',
            erros: resultado.error.issues.map((issue) => ({
                campo: issue.path.join('.').replace(/^(body|params|query)\./, ''),
                mensagem: issue.message
            }))
        });
    }

    req.body = resultado.data.body;
    req.validatedParams = resultado.data.params;
    req.validatedQuery = resultado.data.query;
    return next();
};

module.exports = validar;
