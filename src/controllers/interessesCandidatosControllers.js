const InteressesCandidatoModels = require('../models/interessesCandidatosModels');
const { sucesso, erro400, erro404, erro500 } = require('../utils/apiResponse');

const interesseCandidatosController = {
    salvarInteresses: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato_id = await InteressesCandidatoModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return erro404(res, 'Perfil de candidato não encontrado.');
            }

            const { areas_ids } = req.body;

            if (!areas_ids || !Array.isArray(areas_ids)) {
                return erro400(res, 'O campo areas_ids deve ser um array válido de IDs.');
            }

            const salvas = [];
            for (const area_id of areas_ids) {
                if (!area_id) continue;

                const vinculada = await InteressesCandidatoModels.vincularArea(candidato_id, Number(area_id));
                if (vinculada) {
                    salvas.push(vinculada);
                }
            }

            return sucesso(
                res,
                200,
                'Áreas de interesse vinculadas com sucesso!',
                salvas
            );

        } catch (error) {
            console.error('Erro ao salvar áreas de interesse do candidato:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    listarInteresses: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato_id = await InteressesCandidatoModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return erro404(res, 'Perfil de candidato não encontrado.');
            }

            const lista = await InteressesCandidatoModels.buscarPorCandidato(candidato_id);
            
            return sucesso(
                res,
                200,
                'Áreas de interesse listadas com sucesso.',
                lista
            );
        } catch (error) {
            console.error('Erro ao listar áreas de interesse do candidato:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    desvincularArea: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const { id: area_interesse_id } = req.params;

            const candidato_id = await InteressesCandidatoModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return erro404(res, 'Perfil de candidato não encontrado.');
            }

            const removida = await InteressesCandidatoModels.desvincularArea(candidato_id, Number(area_interesse_id));

            if (!removida) {
                return erro404(res, 'Não foi possível encontrar esta área de interesse vinculada ao perfil.');
            }

            return sucesso(
                res,
                200,
                'Área de interesse desvinculada com sucesso.'
            );
        } catch (error) {
            console.error('Erro ao desvincular área de interesse:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    }
};

module.exports = interesseCandidatosController;