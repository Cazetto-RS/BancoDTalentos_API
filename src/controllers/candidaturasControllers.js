const CandidaturaModel = require('../models/candidaturasModels');
const CandidatoModel = require('../models/candidatoModels');
const { sucesso, erro, erro400, erro401, erro403, erro404, erro500 } = require('../utils/apiResponse')

const CandidaturaController = {
    inscrever: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'candidato') {
                return res.status(403).json({ error: 'Acesso negado. Apenas candidatos podem se inscrever em vagas.' });
            }

            const usuario_id = req.usuario.id;
            const { vaga_id, pretensao_salarial, disponibilidade, preferencia_contrato, preferencia_modelo_trabalho } = req.body;

            if (!vaga_id) {
                return erro400(
                    res,
                    'O campo vaga_id é necessário..'
                )
            }

            if (disponibilidade && !['manhã', 'tarde', 'noite', 'integral'].includes(disponibilidade)) {
                return erro400(
                    res,
                    'Disponibilidade inválida. Use: manhã, tarde, noite ou integral.'
                )
            }
            if (preferencia_contrato && !['CLT', 'PJ'].includes(preferencia_contrato)) {
                return erro400(
                    res,
                    'Preferência de contrato inválida. Use: CLT ou PJ.'
                );
            }
            if (preferencia_modelo_trabalho && !['remoto', 'hibrido', 'presencial'].includes(preferencia_modelo_trabalho)) {
                return erro400(
                    res,
                    'Preferência de modelo de trabalho inválida. Use: remoto, hibrido ou presencial.'
                );
            }

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return erro404(
                    res,
                    'Candidato não encontrado.'
                );
            }

            const novaInscricao = await CandidaturaModel.inscrever({
                vaga_id,
                candidato_id: candidato.id,
                pretensao_salarial,
                disponibilidade,
                preferencia_contrato,
                preferencia_modelo_trabalho
            });

            return sucesso(
                res,
                201,
                'Inscrição realizado com sucesso.',
                novaInscricao
            );
        } catch (error) {
            console.error('Erro ao se candidatar:', error);
            if (error.code === '23505') { return erro400(res, 'Você já se cadastrou nesse vaga.'); }
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    listarMinhasCandidaturas: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'candidato') {
                return res.status(403).json({ error: 'Acesso negado.' });
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

            if (status && !['novo', 'em análise', 'em triagem', 'contratado', 'dispensado'].includes(status)) {
                return erro400 (
                    res,
                    'Status inválido.'
                );
            }

            const atualizada = await CandidaturaModel.atualizarStatus(id, status, favorito);
            if (!atualizada) {
                return erro404 (
                    res,
                    'Candidatura não encontrada.'
                );
            }

            return sucesso(
                res,
                201,
                'Status da candidatura atualizada com sucesso',
                atualizada
            );
        } catch (error) {
            console.error('Erro ao atualizada status da candidatura:', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    }
};

module.exports = CandidaturaController;