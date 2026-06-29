const CandidatoModel = require('../models/candidatoModels');

const CandidatosController = {
    salvarPerfilBase: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const dadosPerfil = req.body;

            const perfilSalvo = await CandidatoModel.salvarOuAtualizarCandidato(usuario_id, dadosPerfil);

            return res.json({
                mensagem: 'Informações básicas salvas com sucesso.',
                dados: perfilSalvo
            });
        } catch (error) {
            console.error('Erro ao salvar informações básicas do perfil: ', error);
            return res.status(500).json({ erro: 'Erro interno ao salvar informações.' })
        }
    },

    buscarPerfilBase: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const perfil = await CandidatoModel.buscarPorUsuarioId(usuario_id);

            if (!perfil) {
                return res.status(404).json({ mensagem: 'Perfil inexistente.' });
            }

            return res.json(perfil);
        } catch (error) {
            console.error('Erro ao buscar perfil: ', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar perfil.' });
        }
    },

    buscarCultura: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const perfil = await CandidatoModel.buscarPorUsuarioId(usuario_id);

            if (!perfil) {
                return res.status(404).json({ mensagem: 'Perfil inexistente.' });
            }

            return res.json(perfil);
        } catch (error) {
            console.error('Erro ao buscar perfil: ', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar perfil.' });
        }
    },


    salvarCultura: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const dadosCultura = req.body;

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id);

            if (!candidato) {
                return res.status(400).json({ erro: 'Você precisa preencher todas as informações.' });
            }

            const culturaSalvar = await CandidatoModel.salvarOuAtualizarCultura(candidato.id, dadosCultura);

            return res.json({
                mensagem: 'Informações salvas com sucesso.',
                dados: culturaSalvar
            });
        } catch (error) {
            console.error('Erro ao salvar cultura do candidato.', error);
            return res.status(500).json({ erro: 'Erro interno ao salvar cultura do candidato.' });
        }
    }
};

module.exports = CandidatosController;