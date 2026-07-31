const AreasInteresseModels = require('../models/areasInteresseModels');
const { sucesso, erro, erro400, erro401, erro403, erro404, erro500 } = require('../utils/apiResponse')

const AreasInteresseController = {
    criar: async (req, res) => {
        try {
            const { nome } = req.body;
            if (!nome) {
                return erro400(
                    res,
                    'O nome é um campo necessário.'
                )
            }

            const novaArea = await AreasInteresseModels.criar({ nome });

            return sucesso(
                res,
                201,
                'Área criada com sucesso.',
                novaArea
            )
        } catch (error) {
            if (error.code === '23505') {return erro400(res, 'Está área já está cadastrada no banco.');}
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    buscarTodas: async (req, res) => {
        try {
            const lista = await AreasInteresseModels.buscarTodos();
            return sucesso(
                res,
                200,
                'Área encontrada:',
                lista
            );
        } catch (error) {
            console.error('Erro ao buscar áreas:', error)
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome } = req.body;

            const atualizada = await AreasInteresseModels.atualizar(id, { nome });
            if (!atualizada) {
                return erro404(
                    res,
                    'Não foi possível encontrar está área.'
                )
            }

            return sucesso(
                res,
                200,
                'Área editada com sucesso.',
                atualizada
            )

        } catch (error) {
            console.error('Erro ao atualizar área:', error)
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            const deletada = await AreasInteresseModels.deletar(id);
            if (!deletada) {
                return erro404(
                    res,
                    'Não foi possível encontrar está área.'
                )
            }

            return sucesso(
                res,
                200,
                'Área deletada com sucesso.',
                deletada
            );

        } catch (error) {
            console.error('Erro ao deletar área:', error)
            return erro500(res, 'Erro interno no servidor.')
        }
    }
};

module.exports = AreasInteresseController;