const CandidaturaModel = require('../models/candidaturasModels');
const CandidatoModel = require('../models/candidatoModels');
const VagaModel = require('../models/vagaModels');
const NotificacaoModel = require('../models/notificacaoModels');
const { sucesso, erro400, erro403, erro404, erro409, erro500 } = require('../utils/apiResponse')

const CandidaturaController = {
    inscrever: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'candidato') {
                return erro403(res, 'Apenas candidatos podem se inscrever em vagas.');
            }

            const usuario_id = req.usuario.id;
            const { vaga_id, pretensao_salarial, disponibilidade, preferencia_contrato, preferencia_modelo_trabalho } = req.body;

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(
                    res,
                    'Candidato não encontrado.'
                );
            }

            const vagaAtiva = await VagaModel.buscarAtivaPorId(vaga_id);
            if (!vagaAtiva) return erro400(res, 'A vaga não existe ou não está aberta para candidaturas.');

            const novaInscricao = await CandidaturaModel.inscrever({
                vaga_id,
                candidato_id: candidato.id,
                pretensao_salarial,
                disponibilidade,
                preferencia_contrato,
                preferencia_modelo_trabalho
            });
            try {
                await NotificacaoModel.criarParaFuncionarios(
                    'nova_candidatura', 'Nova candidatura recebida',
                    `Uma nova candidatura foi enviada para a vaga #${vaga_id}.`,
                    { candidatura_id: novaInscricao.id, vaga_id }
                );
            } catch (notificationError) {
                console.error('Candidatura criada, mas a notificação falhou:', notificationError);
            }

            return sucesso(
                res,
                201,
                'Inscrição realizada com sucesso.',
                novaInscricao
            );
        } catch (error) {
            console.error('Erro ao se candidatar:', error);
            if (error.code === '23505') return erro409(res, 'Você já se candidatou a essa vaga.');
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    listarMinhasCandidaturas: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'candidato') {
                return erro403(res, 'Acesso negado.');
            }

            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id)
            if (!candidato) {
                return erro400(
                    res,
                    'Candidato não encontrado.'
                )
            }

            const minhasInscricoes = await CandidaturaModel.listarPorCandidato(candidato.id);
            return sucesso(
                res,
                200,
                'Candidaturas listadas com sucesso',
                minhasInscricoes
            );

        } catch (error) {
            console.error('Erro ao listar candidaturas do usuário:', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    listarCandidatosPorVaga: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'rh' && req.usuario.cargo !== 'admin') {
                return erro403(
                    res,
                    'Acesso negado'
                );
            }

            const { vagaId } = req.params;
            const candidatosInscritos = await CandidaturaModel.listarPorVaga(vagaId);

            return sucesso(
                res,
                200,
                'Candidaturas listadas com sucesso',
                candidatosInscritos
            );
        } catch (error) {
            console.error('Erro ao listar candidatos por vaga:', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    listarTodasCandidaturas: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'rh' && req.usuario.cargo !== 'admin') {
                return erro403(
                    res,
                    'Acesso negado'
                );
            }

            const todas = await CandidaturaModel.listarTodas();
            return sucesso(
                res,
                200,
                'Candidaturas listadas com sucesso',
                todas
            );

        } catch (error) {
            console.error('Erro ao listar todas as candidaturas:', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    atualizarMinhaCandidatura: async (req, res) => {
        try {
            const candidato = await CandidatoModel.buscarPorUsuarioId(req.usuario.id);
            if (!candidato) return erro404(res, 'Candidato não encontrado.');
            const atualizada = await CandidaturaModel.atualizarPeloCandidato(req.params.id, candidato.id, req.body);
            if (!atualizada) return erro404(res, 'Candidatura não encontrada ou não pode mais ser alterada.');
            return sucesso(res, 200, 'Candidatura atualizada com sucesso.', atualizada);
        } catch (error) {
            console.error('Erro ao atualizar candidatura:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    cancelarMinhaCandidatura: async (req, res) => {
        try {
            const candidato = await CandidatoModel.buscarPorUsuarioId(req.usuario.id);
            if (!candidato) return erro404(res, 'Candidato não encontrado.');
            const cancelada = await CandidaturaModel.cancelarPeloCandidato(req.params.id, candidato.id);
            if (!cancelada) return erro404(res, 'Candidatura não encontrada ou não pode mais ser cancelada.');
            return sucesso(res, 200, 'Candidatura cancelada com sucesso.', cancelada);
        } catch (error) {
            console.error('Erro ao cancelar candidatura:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    atualizarStatusCandidato: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'rh' && req.usuario.cargo !== 'admin') {
                return erro403(
                    res,
                    'Acesso negado'
                );
            }

            const { id } = req.params;
            const { status, favorito } = req.body;

            const anterior = await CandidaturaModel.buscarPorId(id);

            const atualizada = await CandidaturaModel.atualizarStatus(id, status, favorito);
            if (!atualizada) {
                return erro404 (
                    res,
                    'Candidatura não encontrada.'
                );
            }

            if (status && anterior && anterior.status !== status) {
                try {
                    await NotificacaoModel.criarParaUsuario(
                        anterior.usuario_id, 'status_candidatura',
                        'Seu processo seletivo foi atualizado',
                        `Sua candidatura para “${anterior.vaga_titulo}” foi atualizada para: ${status}.`,
                        { candidatura_id: Number(id), vaga_id: anterior.vaga_id, status }
                    );
                } catch (notificationError) {
                    console.error('Status atualizado, mas a notificação falhou:', notificationError);
                }
            }

            return sucesso(
                res,
                200,
                'Status da candidatura atualizado com sucesso.',
                atualizada
            );
        } catch (error) {
            console.error('Erro ao atualizada status da candidatura:', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    }
};

module.exports = CandidaturaController;
