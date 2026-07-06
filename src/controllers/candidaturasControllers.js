const CandidaturaModel = require('../models/candidaturasModels');
const CandidatoModel = require('../models/candidatoModels');

const CandidaturaController = {
    inscrever: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'candidato') {
                return res.status(403).json({error: 'Acesso negado. Apenas candidatos podem se inscrever em vagas.'});
            }

            const usuario_id = req.usuario.id;
            const {vaga_id, pretensao_salarial, disponibilidade, preferencia_contrato, preferencia_modelo_trabalho} = req.body;

            if (!vaga_id) {
                return res.status(400).json({error: 'O campo vaga_id é obrigatório.'});
            }

            if (disponibilidade && !['manhã', 'tarde', 'noite', 'integral'].includes(disponibilidade)) {
                return res.status(400).json({ erro: 'Disponibilidade inválida. Use: manhã, tarde, noite ou integral.' });
            }
            if (preferencia_contrato && !['CLT', 'PJ'].includes(preferencia_contrato)) {
                return res.status(400).json({ erro: 'Preferência de contrato inválida. Use: CLT ou PJ.' });
            }
            if (preferencia_modelo_trabalho && !['remoto', 'hibrido', 'presencial'].includes(preferencia_modelo_trabalho)) {
                return res.status(400).json({ erro: 'Preferência de modelo de trabalho inválida. Use: remoto, hibrido ou presencial.' });
            }

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return res.status(400).json({error: 'Candidato não encontrado.'});
            }

            const novaInscricao = await CandidaturaModel.inscrever({
                vaga_id,
                candidato_id: candidato.id,
                pretensao_salarial,
                disponibilidade,
                preferencia_contrato,
                preferencia_modelo_trabalho
            });

            return res.status(201).json({
                mensagem: 'Inscrição realizado com sucesso.',
                dados: novaInscricao
            });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({erro: 'Você já se inscreveu nesta vaga.'});
            }
            console.error('Erro ao se candidatar:', error);
            return res.status(500).json({erro: 'Erro interno ao realizar inscrição.'});
        }
    },

    listarMinhasCandidaturas: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'candidato') {
                return res.status(403).json({error: 'Acesso negado.'});
            }

            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id)
            if (!candidato) {
                return res.status(400).json({erro: 'Candidato não encontrado.'});
            }

            const minhasInscricoes = await CandidaturaModel.listarPorCandidato(candidato.id);
            return res.json(minhasInscricoes);
        } catch (error) {
            console.error('Erro ao listar candidaturas do usuário:', error);
            return res.status(500).json({erro: 'Erro interno ao buscar suas candidaturas.'});
        }
    },

    listarCandidatosPorVaga: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'rh' && req.usuario.cargo !== 'admin') {
                return res.status(403).json({erro: 'Acesso negado'});
            }

            const {vagaId} = req.params;
            const candidatosInscritos = await CandidaturaModel.listarPorVaga(vagaId);

            return res.json(candidatosInscritos);
        } catch (error) {
            console.error('Erro ao listar candidatos por vaga:', error);
            return res.status(500).json({erro: 'Erro interno ao buscar candidatos.'});
        }
    },

    listarTodasCandidaturas: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'rh' && req.usuario.cargo !== 'admin') {
                return res.status(403).json({erro: 'Acesso negado'});
            }

            const todas = await CandidaturaModel.listarTodas();

            return res.json(todas);
        } catch (error) {
            console.error('Erro ao listar todas as candidaturas:', error);
            return res.status(500).json({erro: 'Erro interno ao listar todas as candidaturas.'});
        }
    },

    atualizarStatusCandidato: async (req, res) => {
        try {
            if (req.usuario.cargo !== 'rh' && req.usuario.cargo !== 'admin') {
                return res.status(403).json({erro: 'Acesso negado'});
            }

            const {id} = req.params;
            const {status, favorito} = req.body;

            if (status && !['novo', 'em análise', 'em triagem', 'contratado', 'dispensado'].includes(status)){
                return res.status(404).json({erro: 'Status inválido.'});
            }

            const atualizada = await CandidaturaModel.atualizarStatus(id, status, favorito);
            if (!atualizada) {
                return res.status(404).json({erro: 'Candidatura não encontrada.'});
            }

            return res.json({
                mensagem: 'Status da candidatura atualizada com sucesso',
                dados: atualizada
            });
        } catch (error) {
            console.error('Erro ao atualizada status da candidatura:', error);
            return res.status(500).json({erro: 'Erro interno ao atualizar status.'});
        }
    }
};

module.exports = CandidaturaController;