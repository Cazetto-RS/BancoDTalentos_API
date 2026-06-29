const HistoricoModels = require('../models/historicoModels');
const CandidatoModels = require('../models/candidatoModels')

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
                return res.status(400).json({ erro: 'Perfil do candidato não encontrado.' });
            }

            const salvas = await HistoricoModels.adicionarExperiencias(candidato.id, experiencias);

            return res.json({
                mensagem: 'Experiências profissionais salvas com sucesso',
                dados: salvas
            });
        } catch (error) {
            console.error('Erro ao salvar experiências:', error);
            return res.status(500).json({ erro: 'Erro interno ao salvar experiências.' });
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
                return res.status(400).json({ erro: 'Perfil de candidato não encontrado.' });
            }

            for (const form of formacoes) {
                if (form.turno && !['manhã', 'tarde', 'noite'].includes(form.turno)) {
                    return res.status(400).json({ erro: 'Turno inválido' });
                }
                if (form.status && !['cursando', 'concluido', 'trancado'].includes(form.status)) {
                    return res.status(400).json({ erro: 'Status inválido' });
                }
            }

            const salvas = await HistoricoModels.adicionarFormacoes(candidato.id, formacoes);

            return res.json({
                mensagem: 'Formações acadêmicas salvas com sucesso.',
                dados: salvas
            });
        } catch (error) {
            console.error('Erro ao salvar formações:', error);
            return res.status(500).json({ erro: 'Erro interno ao salvar histórico acadêmico.' });
        }
    },

    editarExperiencias: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;
            const dadosUpdate = req.body;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return res.status(400).json({ erro: 'Perfil do candidato não encontrado.' });
            }

            const atualizado = await HistoricoModels.editarExperiencias(id, candidato.id, dadosUpdate);
            if (!atualizado) {
                return res.status(404).json({ erro: 'Erro interno ao editar experiência.' });
            }

            return res.json({
                mensagem: 'Experiência editada com sucesso.',
                dados: atualizado
            });
        } catch (error) {
            console.error('Erro interno ao editar experiência.', error);
            return res.status(500).json({ erro: 'Erro interno editar experiências.' })
        }
    },

    editarFormacoes: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;
            const dadosUpdate = req.body;

            if (dadosUpdate.turno && !['manhã', 'tarde', 'noite'].includes(dadosUpdate.turno)) {
                return res.status(400).json({ erro: 'Turno inválido.' });
            }
            if (dadosUpdate.status && !['cursando', 'concluido', 'trancado'].includes(dadosUpdate.status)) {
                return res.status(400).json({ erro: 'Status inválido.' });
            }

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return res.status(400).json({ erro: 'Perfil do candidato não encontrado.' });
            }

            const atualizado = await HistoricoModels.editarFormacoes(id, candidato.id, dadosUpdate);
            if (!atualizado) {
                return res.status(404).json({ erro: 'Erro interno ao editar formação.' });
            }

            return res.json({
                mensagem: 'Formação editada com sucesso.',
                dados: atualizado
            });
        } catch (error) {
            console.error('Erro interno ao editar formação.', error);
            return res.status(500).json({ error: 'Erro interno ao editar formação.' })
        }
    },

    deletarExperiencias: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return res.status(400).json({ erro: 'Perfil do candidato não encontrado.' })
            }

            const deletada = await HistoricoModels.deletarExperiencias(id, candidato.id);
            if (!deletada) {
                return res.status(404).json({ erro: 'Experiência não encontrada ou já excluída.' });
            }
        } catch (error) {
            console.error('Erro interno ao deletar experiência.', error);
            return res.status(500).json({ error: 'Erro interno ao deletar experiência.' });
        }
    },

    deletarFormacoes: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return res.status(400).json({ erro: 'Perfil do candidato não encontrado.' })
            }

            const deletada = await HistoricoModels.deletarFormacoes(id, candidato.id);
            if (!deletada) {
                return res.status(404).json({ erro: 'Formação não encontrada ou já excluída.' });
            }
        } catch (error) {
            console.error('Erro interno ao deletar formação.', error);
            return res.status(500).json({ error: 'Erro interno ao deletar formação.' });
        }
    },

    buscarExperiencias: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return res.status(400).json({erro: 'Perfil do candidato não encontrado'});
            }

            const experiencias = await HistoricoModels.buscarExperienciasPorCandidatoId(candidato.id);

            return res.json({
                experiencias
            })
        } catch (error) {
            console.error('Erro ao obter histórico completo', error);
            return res.status(500).json({erro: 'Erro interno ao buscar histórico.'})
        }
    },

    buscarFormacoes: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModels.buscarPorUsuarioId(usuario_id);
            if (!candidato) {
                return res.status(400).json({erro: 'Perfil do candidato não encontrado'});
            }

            const formacoes = await HistoricoModels.buscarFormacoesPorCandidatoId(candidato.id);

            return res.json({
                formacoes
            })
        } catch (error) {
            console.error('Erro ao obter histórico completo', error);
            return res.status(500).json({erro: 'Erro interno ao buscar histórico.'})
        }
    },
};

module.exports = HistoricoControllers