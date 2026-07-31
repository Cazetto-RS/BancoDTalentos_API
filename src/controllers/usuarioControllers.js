const UsuarioModel = require('../models/usuarioModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sucesso, erro400, erro401, erro403, erro404, erro500 } = require('../utils/apiResponse');

const usuarioController = {
    registrarCandidato: async (req, res) => {
        try {
            const { nome_completo, email, senha } = req.body;

            if (!nome_completo || !email || !senha) {
                return erro400(res, 'Nome, e-mail e senha são campos obrigatórios');
            }

            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return erro400(res, 'Este e-mail já está vinculado a um perfil');
            }

            const salt = await bcrypt.genSalt(10);
            const senha_hash = await bcrypt.hash(senha, salt);

            const novoCandidato = await UsuarioModel.criarCandidato({
                nome_completo,
                email,
                senha_hash
            });

            return sucesso(
                res,
                201,
                'Cadastro realizado com sucesso!',
                novoCandidato
            );
        } catch (error) {
            console.error('Erro ao registrar novo candidato... :', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;

            const usuario = await UsuarioModel.buscarPorId(id);

            if (!usuario) {
                return erro404(res, 'Usuário não encontrado.');
            }

            return sucesso(
                res,
                200,
                'Usuário encontrado com sucesso.',
                usuario
            );
        } catch (error) {
            console.error('Erro ao buscar usuário pelo ID: ', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarPorNome: async (req, res) => {
        try {
            const { nome } = req.query;

            if (!nome) {
                return erro400(res, 'O parâmetro nome é obrigatório.');
            }

            const usuario = await UsuarioModel.buscarPorNome(nome);

            return sucesso(
                res,
                200,
                'Usuário(s) encontrado(s) com sucesso.',
                usuario
            );
        } catch (error) {
            console.error('Erro ao buscar nome do usuário: ', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarTodos: async (req, res) => {
        try {
            const usuario = await UsuarioModel.buscarTodos();
            return sucesso(
                res,
                200,
                'Usuários listados com sucesso.',
                usuario
            );
        } catch (error) {
            console.error('Erro ao buscar todos os usuários: ', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    login: async (req, res) => {
        try {
            const { email, senderSenha } = req.body;
            const senhaFornecida = req.body.senha || senderSenha;

            if (!email || !senhaFornecida) {
                return erro400(res, 'E-mail e senha são campos obrigatórios.');
            }

            const usuario = await UsuarioModel.buscarPorEmail(email);
            if (!usuario) {
                return erro401(res, 'E-mail ou senha inválidos.');
            }

            const senhaValida = await bcrypt.compare(senhaFornecida, usuario.senha_hash);
            if (!senhaValida) {
                return erro401(res, 'E-mail ou senha inválidos.');
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, cargo: usuario.cargo },
                env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            await UsuarioModel.criarSessao(usuario.id, token);

            return sucesso(
                res,
                200,
                'Login realizado com sucesso!',
                {
                    token,
                    usuario: {
                        id: usuario.id,
                        nome_completo: usuario.nome_completo,
                        email: usuario.email,
                        cargo: usuario.cargo
                    }
                }
            );
        } catch (error) {
            console.error('Erro ao realizar o login', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    registrarPorAdmin: async (req, res) => {
        try {
            const { nome_completo, email, senha, cargo } = req.body;

            if (!['admin', 'rh'].includes(cargo)) {
                return erro400(res, 'Cargo inválido. Escolha entre "admin" e "rh".');
            }

            if (!nome_completo || !email || !senha) {
                return erro400(res, 'Todos os campos devem ser preenchidos.');
            }

            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return erro400(res, 'Já existe um usuário com este e-mail.');
            }

            const salt = await bcrypt.genSalt(10);
            const senha_hash = await bcrypt.hash(senha, salt);

            const novoUsuario = await UsuarioModel.criarUsuarioPorAdmin({
                nome_completo,
                email,
                senha_hash,
                cargo
            });

            return sucesso(
                res,
                201,
                `Conta de ${cargo.toUpperCase()} criada com sucesso.`,
                novoUsuario
            );
        } catch (error) {
            console.error('Erro ao criar conta coorporativa: ', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    atualizarInformacoes: async (req, res) => {
        try {
            const { id } = req.params;
            const idUsuarioLogado = req.usuario.id;

            if (parseInt(id) !== idUsuarioLogado) {
                return erro403(res, 'Acesso negado. Você só pode alterar informações do próprio perfil.');
            }

            const { nome_completo, email, senha } = req.body;

            if (email) {
                const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
                if (usuarioExistente && usuarioExistente.id !== idUsuarioLogado) {
                    return erro400(res, 'Este e-mail já está vinculado a outra conta.');
                }
            }

            let senha_hash = null;
            if (senha) {
                const salt = await bcrypt.genSalt(10);
                senha_hash = await bcrypt.hash(senha, salt);
            }

            const usuarioAtualizado = await UsuarioModel.atualizarInformacoes(id, {
                nome_completo,
                email,
                senha_hash,
            });

            return sucesso(
                res,
                200,
                'Perfil atualizado com sucesso.',
                usuarioAtualizado
            );
        } catch (error) {
            console.error('Erro ao atualizar perfil.', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    deletarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const idUsuarioLogado = req.usuario.id;
            const senha = req.headers['confirma-senha'];

            if (!senha) {
                return erro400(res, 'A confirmação de senha é obrigatória. Envie o cabeçalho confirma-senha.');
            }

            if (parseInt(id) !== idUsuarioLogado) {
                return erro403(res, 'Acesso negado. Você só pode deletar o seu próprio perfil.');
            }

            const usuario = await UsuarioModel.buscarSenhaHash(id);

            if (!usuario) {
                return erro404(res, 'Usuário não encontrado.');
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
            if (!senhaValida) {
                return erro401(res, 'Senha incorreta. Operação de exclusão cancelada.');
            }

            await UsuarioModel.deletarUsuario(id);

            return sucesso(
                res,
                200,
                'Sua conta e todos os dados vinculados foram excluídos com sucesso.'
            );

        } catch (error) {
            console.error('Erro ao deletar perfil:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    }
};

module.exports = usuarioController;