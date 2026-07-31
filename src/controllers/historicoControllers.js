const HistoricoModels = require('../models/historicoModels');
const CandidatoModels = require('../models/candidatoModels');
const { sucesso, erro400, erro404, erro500 } = require('../utils/apiResponse');

const HistoricoControllers = {
    salvarExperiencias: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            let experiencias = req.body;

            if (!Array.isArray(experiencias)) {
                experiencias = [experiencias];
            }

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil do candidato não encontrado.');
            }

            const salvas = await HistoricoModels.adicionarExperiencias(candidato.id, experiencias);

            return sucesso(
                res,
                200,
                'Experiências profissionais salvas com sucesso',
                salvas
            );
        } catch (error) {
            console.error('Erro ao salvar experiências:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    salvarFormacoes: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            let formacoes = req.body;

            if (!Array.isArray(formacoes)) {
                formacoes = [formacoes];
            }

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil de candidato não encontrado.');
            }

            for (const form of formacoes) {
                if (form.turno && !['manhã', 'tarde', 'noite'].includes(form.turno)) {
                    return erro400(res, 'Turno inválido. Use: manhã, tarde ou noite.');
                }
                if (form.status && !['cursando', 'concluido', 'trancado'].includes(form.status)) {
                    return erro400(res, 'Status inválido. Use: cursando, concluido ou trancado.');
                }
            }

            const salvas = await HistoricoModels.adicionarFormacoes(candidato.id, formacoes);

            return sucesso(
                res,
                200,
                'Formações acadêmicas salvas com sucesso.',
                salvas
            );
        } catch (error) {
            console.error('Erro ao salvar formações:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    editarExperiencias: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;
            const dadosUpdate = req.body;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil do candidato não encontrado.');
            }

            const atualizado = await HistoricoModels.editarExperiencias(id, candidato.id, dadosUpdate);
            if (!atualizado) {
                return erro404(res, 'Experiência não encontrada.');
            }

            return sucesso(
                res,
                200,
                'Experiência editada com sucesso.',
                atualizado
            );
        } catch (error) {
            console.error('Erro interno ao editar experiência.', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    editarFormacoes: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;
            const dadosUpdate = req.body;

            if (dadosUpdate.turno && !['manhã', 'tarde', 'noite'].includes(dadosUpdate.turno)) {
                return erro400(res, 'Turno inválido. Use: manhã, tarde ou noite.');
            }
            if (dadosUpdate.status && !['cursando', 'concluido', 'trancado'].includes(dadosUpdate.status)) {
                return erro400(res, 'Status inválido. Use: cursando, concluido ou trancado.');
            }

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil do candidato não encontrado.');
            }

            const atualizado = await HistoricoModels.editarFormacoes(id, candidato.id, dadosUpdate);
            if (!atualizado) {
                return erro404(res, 'Formação não encontrada.');
            }

            return sucesso(
                res,
                200,
                'Formação editada com sucesso.',
                atualizado
            );
        } catch (error) {
            console.error('Erro interno ao editar formação.', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    deletarExperiencias: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil do candidato não encontrado.');
            }

            const deletada = await HistoricoModels.deletarExperiencias(id, candidato.id);
            if (!deletada) {
                return erro404(res, 'Experiência não encontrada ou já excluída.');
            }

            return sucesso(
                res,
                200,
                'Experiência excluída com sucesso!'
            );
        } catch (error) {
            console.error('Erro interno ao deletar experiência.', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    deletarFormacoes: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil do candidato não encontrado.');
            }

            const deletada = await HistoricoModels.deletarFormacoes(id, candidato.id);
            if (!deletada) {
                return erro404(res, 'Formação não encontrada ou já excluída.');
            }

            return sucesso(
                res,
                200,
                'Formação excluída com sucesso!'
            );
        } catch (error) {
            console.error('Erro interno ao deletar formação.', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarExperiencias: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil do candidato não encontrado.');
            }

            const experiencias = await HistoricoModels.buscarExperienciasPorCandidatoId(candidato.id);

            return sucesso(
                res,
                200,
                'Experiências listadas com sucesso.',
                { experiencias }
            );
        } catch (error) {
            console.error('Erro ao obter histórico completo', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarFormacoes: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(res, 'Perfil do candidato não encontrado.');
            }

            const formacoes = await HistoricoModels.buscarFormacoesPorCandidatoId(candidato.id);

            return sucesso(
                res,
                200,
                'Formações listadas com sucesso.',
                { formacoes }
            );
        } catch (error) {
            console.error('Erro ao obter histórico completo', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },
};

module.exports = HistoricoControllers;