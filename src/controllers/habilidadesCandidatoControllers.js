const HabilidadesCandidatosModels = require('../models/habilidadesCandidatoModels');

const HabilidadesCandidatosController = {
    salvarHabilidades: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            // 💡 1. Traduz usuario_id para o ID da tabela candidatos
            const candidato_id = await HabilidadesCandidatosModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return res.status(404).json({ erro: 'Perfil de candidato não encontrado para este usuário.' });
            }

            const { habilidades } = req.body;

            if (!habilidades || !Array.isArray(habilidades)) {
                return res.status(400).json({ erro: 'O campo habilidades deve ser um array válido.' });
            }

            const salvar = [];
            for (const hab of habilidades) {
                if (!hab || typeof hab !== 'object') continue;

                const { habilidade_id, nivel, nivel_experiencia } = hab;

                if (!habilidade_id) continue;

                if (nivel && (nivel < 1 || nivel > 5)) {
                    return res.status(400).json({ erro: 'O nível da habilidade deve ser entre 1 e 5.' });
                }

                if (nivel_experiencia && !['junior', 'pleno', 'senior', 'especialista'].includes(nivel_experiencia)) {
                    return res.status(400).json({ erro: 'O nível de experiência está inválido, campos aceitos: junior, pleno, senior e especialista.' });
                }

                const vinculada = await HabilidadesCandidatosModels.vincularCandidato(candidato_id, habilidade_id, {
                    nivel,
                    nivel_experiencia
                });
                salvar.push(vinculada);
            }

            return res.status(200).json({
                mensagem: 'Habilidades do candidato processadas com sucesso!',
                dados: salvar
            });

        } catch (error) {
            console.error('Erro ao salvar habilidades do candidato:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    },

    listarHabilidades: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            // 💡 1. Traduz usuario_id para o ID da tabela candidatos
            const candidato_id = await HabilidadesCandidatosModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return res.status(404).json({ erro: 'Perfil de candidato não encontrado.' });
            }

            const lista = await HabilidadesCandidatosModels.buscarPorCandidato(candidato_id);
            return res.json(lista);
        } catch (error) {
            console.error('Erro ao listar todas as habilidades do candidato:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    },

    desvincularHabilidade: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const { id: habilidade_id } = req.params; // Captura do :id da rota

            // 💡 1. Traduz usuario_id para o ID da tabela candidatos
            const candidato_id = await HabilidadesCandidatosModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return res.status(404).json({ erro: 'Perfil de candidato não encontrado.' });
            }

            const removida = await HabilidadesCandidatosModels.desvincular(candidato_id, habilidade_id);

            if (!removida) {
                return res.status(404).json({ erro: 'Não foi possível encontrar esta habilidade vinculada ao perfil.' });
            }

            return res.json({ mensagem: 'Habilidade desvinculada com sucesso.' });
        } catch (error) {
            console.error('Erro ao desvincular habilidades do candidato:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    }
};

module.exports = HabilidadesCandidatosController;