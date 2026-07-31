const HabilidadesCandidatosModels = require('../models/habilidadesCandidatoModels');
const { sucesso, erro400, erro404, erro500 } = require('../utils/apiResponse');

const HabilidadesCandidatosController = {
    salvarHabilidades: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato_id = await HabilidadesCandidatosModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return erro404(res, 'Perfil de candidato não encontrado para este usuário.');
            }

            const { habilidades } = req.body;

            if (!habilidades || !Array.isArray(habilidades)) {
                return erro400(res, 'O campo habilidades deve ser um array válido.');
            }

            const salvar = [];
            for (const hab of habilidades) {
                if (!hab || typeof hab !== 'object') continue;

                const { habilidade_id, nivel, nivel_experiencia } = hab;

                if (!habilidade_id) continue;

                if (nivel && (nivel < 1 || nivel > 5)) {
                    return erro400(res, 'O nível da habilidade deve ser entre 1 e 5.');
                }

                if (nivel_experiencia && !['junior', 'pleno', 'senior', 'especialista'].includes(nivel_experiencia)) {
                    return erro400(res, 'O nível de experiência está inválido, campos aceitos: junior, pleno, senior e especialista.');
                }

                const vinculada = await HabilidadesCandidatosModels.vincularCandidato(candidato_id, habilidade_id, {
                    nivel,
                    nivel_experiencia
                });
                salvar.push(vinculada);
            }

            return sucesso(
                res,
                200,
                'Habilidades do candidato processadas com sucesso!',
                salvar
            );

        } catch (error) {
            console.error('Erro ao salvar habilidades do candidato:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    listarHabilidades: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato_id = await HabilidadesCandidatosModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return erro404(res, 'Perfil de candidato não encontrado.');
            }

            const lista = await HabilidadesCandidatosModels.buscarPorCandidato(candidato_id);
            return sucesso(
                res,
                200,
                'Habilidades listadas com sucesso.',
                lista
            );
        } catch (error) {
            console.error('Erro ao listar todas as habilidades do candidato:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    desvincularHabilidade: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const { id: habilidade_id } = req.params;

            const candidato_id = await HabilidadesCandidatosModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return erro404(res, 'Perfil de candidato não encontrado.');
            }

            const removida = await HabilidadesCandidatosModels.desvincular(candidato_id, habilidade_id);

            if (!removida) {
                return erro404(res, 'Não foi possível encontrar esta habilidade vinculada ao perfil.');
            }

            return sucesso(
                res,
                200,
                'Habilidade desvinculada com sucesso.'
            );
        } catch (error) {
            console.error('Erro ao desvincular habilidades do candidato:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    }
};

module.exports = HabilidadesCandidatosController;