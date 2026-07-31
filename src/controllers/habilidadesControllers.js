const HabilidadesModels = require('../models/habilidadesModels');
const { sucesso, erro400, erro404, erro500 } = require('../utils/apiResponse');

const HabilidadesControllers = {
    criar: async (req, res) => {
        try {
            const { nome, categoria } = req.body;
            
            if (!nome || !categoria) {
                return erro400(res, 'Nome e categoria são campos obrigatórios.');
            }

            if (!['hard', 'soft'].includes(categoria)) {
                return erro400(res, 'Valor inválido. Use: hard ou soft.');
            }

            const nova = await HabilidadesModels.criar({ nome, categoria });
            
            return sucesso(
                res,
                201,
                'Habilidade criada com sucesso.',
                nova
            );
        } catch (error) {
            if (error.code === '23505') {
                return erro400(res, 'Esta habilidade já está cadastrada.');
            }
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarTodas: async (req, res) => {
        try {
            const lista = await HabilidadesModels.buscarTodos();
            return sucesso(
                res,
                200,
                'Habilidades listadas com sucesso.',
                lista
            );
        } catch (error) {
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, categoria } = req.body;

            const atualizada = await HabilidadesModels.atualizar(id, { nome, categoria });
            
            if (!atualizada) {
                return erro404(res, 'Habilidade não encontrada.');
            }

            return sucesso(
                res,
                200,
                'Habilidade atualizada com sucesso!',
                atualizada
            );
            
        } catch (error) {
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            const deletado = await HabilidadesModels.deletar(id);
            
            if (!deletado) {
                return erro404(res, 'Habilidade não encontrada.');
            }

            return sucesso(
                res,
                200,
                'Habilidade excluída com sucesso!'
            );
        } catch (error) {
            return erro500(res, 'Erro interno no servidor.');
        }
    }
};

module.exports = HabilidadesControllers;