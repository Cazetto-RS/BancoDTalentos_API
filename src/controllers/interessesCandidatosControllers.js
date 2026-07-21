const InteressesCandidatoModels = require ('../models/interessesCandidatosModels');

const interesseCandidatosController = {
    salvarInteresses: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            // 💡 Traduz usuario_id para candidato_id
            const candidato_id = await InteressesCandidatoModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return res.status(404).json({ erro: 'Perfil de candidato não encontrado.' });
            }

            const { areas_ids } = req.body; // Espera um array de IDs, ex: [1, 2, 5]

            if (!areas_ids || !Array.isArray(areas_ids)) {
                return res.status(400).json({ erro: 'O campo areas_ids deve ser um array válido de IDs.' });
            }

            const salvas = [];
            for (const area_id of areas_ids) {
                if (!area_id) continue;

                const vinculada = await InteressesCandidatoModels.vincularArea(candidato_id, Number(area_id));
                if (vinculada) {
                    salvas.push(vinculada);
                }
            }

            return res.status(200).json({
                mensagem: 'Áreas de interesse vinculadas com sucesso!',
                dados: salvas
            });

        } catch (error) {
            console.error('Erro ao salvar áreas de interesse do candidato:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    },

    listarInteresses: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato_id = await InteressesCandidatoModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return res.status(404).json({ erro: 'Perfil de candidato não encontrado.' });
            }

            const lista = await InteressesCandidatoModels.buscarPorCandidato(candidato_id);
            return res.json(lista);
        } catch (error) {
            console.error('Erro ao listar áreas de interesse do candidato:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    },

    desvincularArea: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const { id: area_interesse_id } = req.params; // Recebe o id da área de interesse na URL

            const candidato_id = await InteressesCandidatoModels.buscarCandidatoIdPorUsuario(usuario_id);

            if (!candidato_id) {
                return res.status(404).json({ erro: 'Perfil de candidato não encontrado.' });
            }

            const removida = await InteressesCandidatoModels.desvincularArea(candidato_id, Number(area_interesse_id));

            if (!removida) {
                return res.status(404).json({ erro: 'Não foi possível encontrar esta área de interesse vinculada ao perfil.' });
            }

            return res.json({ mensagem: 'Área de interesse desvinculada com sucesso.' });
        } catch (error) {
            console.error('Erro ao desvincular área de interesse:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    }
}

module.exports = interesseCandidatosController