const CandidatoModel = require('../models/candidatoModels');
const { sucesso, erro, erro400, erro401, erro403, erro404, erro500 } = require('../utils/apiResponse')

const CandidatosController = {
    salvarPerfilBase: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const dadosPerfil = req.body;

            const perfilSalvo = await CandidatoModel.salvarOuAtualizarCandidato(usuario_id, dadosPerfil);

            return sucesso(
                res,
                201,
                'Perfil criado com sucesso.',
                perfilSalvo
            )

        } catch (error) {
            console.error('Erro ao salvar informações básicas do perfil: ', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    buscarPerfilBase: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const perfil = await CandidatoModel.buscarPorUsuarioId(usuario_id);

            if (!perfil) {
                return erro404(
                    res,
                    'Não foi possível encontrar este perfil.'
                )
            }

            return sucesso(
                res,
                200,
                'Perfil encontrado:',
                perfil
            )

        } catch (error) {
            console.error('Erro ao buscar perfil: ', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    },

    buscarCultura: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id);

            if (!candidato) {
                return erro404(
                    res,
                    'Não foi possível encontrar este perfil.'
                )
            }

            const cultura = await CandidatoModel.buscarCulturaCandidatos(candidato.id)

            if (!cultura) {
                return erro404(
                    res,
                    'Não foi possível encontrar esta cultura.'
                )
            }

            return sucesso(
                res,
                200,
                'Cultura encontrada:',
                cultura
            )

        } catch (error) {
            console.error('Erro ao buscar perfil: ', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    },


    salvarCultura: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const dadosCultura = req.body;

            const candidato = await CandidatoModel.buscarPorUsuarioId(usuario_id);

            if (!candidato) {
                return erro400(
                    res,
                    'É necessário preencher todas as informações.'
                )
            }

            const culturaSalvar = await CandidatoModel.salvarOuAtualizarCultura(candidato.id, dadosCultura);

            return sucesso(
                res,
                201,
                'Cultura criada com sucesso.',
                culturaSalvar
            )

        } catch (error) {
            console.error('Erro ao salvar cultura do candidato.', error);
            return erro500(res, 'Erro interno no servidor.')
        }
    }
};

module.exports = CandidatosController;