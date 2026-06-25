const UsuarioModel = require('../models/usuarioModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usuarioController = {
    registrarCandidato: async (req, res) => {
        try {
            const { nome_completo, email, senha } = req.body;

            if (!nome_completo || !email || !senha) {
                return res.status(400).json({ erro: 'Nome, e-mail e senha são campos obrigatórios' });
            }

            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({ erro: 'Este e-mail já está vinculado a um perfil' });
            }

            const salt = await bcrypt.genSalt(10);
            const senha_hash = await bcrypt.hash(senha, salt);

            const novoCandidato = await UsuarioModel.criarCandidato({
                nome_completo,
                email,
                senha_hash
            });

            return res.status(201).json({
                mensagem: 'Cadastro realizado com sucesso!',
                dados: novoCandidato
            });
        } catch (error) {
            console.error('Erro ao registrar novo candidato... :', error);
            return res.status(500).json({ erro: 'Erro interno ao processar cadastro, tente novamente :' });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;

            const usuario = await UsuarioModel.buscarPorId(id);

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            return res.json(usuario);
        } catch (error) {
            console.error('Erro ao buscar usuário pelo ID: ', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar usuário.' })
        }
    },

    buscarPorNome: async (req, res) => {
        try {
            const { nome } = req.query;

            if (!nome) {
                return res.status(404).json({ erro: 'O parâmetro nome é obrigatório.' });
            }

            const usuario = await UsuarioModel.buscarPorNome(nome);

            return res.json(usuario);
        } catch (error) {
            console.error('Erro ao buscar nome do usuário: ', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar usuário.' })
        }
    },

    buscarTodos: async (req, res) => {
        try {
            const usuario = await UsuarioModel.buscarTodos();
            return res.json(usuario);
        } catch (error) {
            console.error('Erro ao buscar todos os usuários: ', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar todos os usuários.' })
        }
    },

    login: async (req, res) => {
        try {
            const { email, senderSenha } = req.body; // não faça pergunta do pq o senderSenha, tava sem criatividade e inventei isso
            const senhaFornecida = req.body.senha || senderSenha;

            if (!email || !senhaFornecida) {
                return res.status(400).json({ erro: 'E-mail e senha não campos obrigatórios.' });
            }

            const usuario = await UsuarioModel.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
            }

            const senhaValida = await bcrypt.compare(senhaFornecida, usuario.senha_hash);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'E-mail ou senha inválidos.' })
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, cargo: usuario.cargo },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            await UsuarioModel.criarSessao(usuario.id, token);

            return res.json({
                mensagem: 'Login realizado com sucesso!',
                token,
                usuario: {
                    id: usuario.id,
                    nome_completo: usuario.nome_completo,
                    email: usuario.email,
                    cargo: usuario.cargo
                }
            });
        } catch (error) {
            console.error('Erro ao realizar o login', error);
            return res.status(500).json({ erro: 'Erro interno no servidor ao realizar login.' });
        }
    },

    registrarPorAdmin: async (req, res) => {
        try {
            const { nome_completo, email, senha, cargo } = req.body;

            if (!['admin', 'rh'].includes(cargo)) {
                return res.status(400).json({ erro: 'Cargo inválido. Escolha entre "admin" e "rh".' });
            }

            if (!nome_completo || !email || !senha) {
                return res.status(400).json({ erro: 'Todos os campos devem ser preenchidos.' });
            }

            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({ erro: 'Já existe um usuário com este e-mail.' });
            }

            const salt = await bcrypt.genSalt(10);
            const senha_hash = await bcrypt.hash(senha, salt);

            const novoUsuario = await UsuarioModel.criarUsuarioPorAdmin({
                nome_completo,
                email,
                senha_hash,
                cargo
            });

            return res.status(201).json({
                mensagem: `Conta de ${cargo.toUpperCase()} criado com sucesso.`,
                usuario: novoUsuario
            });
        } catch (error) {
            console.error('Erro ao criar conta coorporativa: ', error);
            return res.status(500).json({ erro: 'Erro interno ao criar usuário.' })
        }
    },

    atualizarInformacoes: async (req, res) => {
        try {
            const { id } = req.params;
            const idUsuarioLogado = req.usuario.id;

            if (parseInt(id) !== idUsuarioLogado) {
                return res.status(403).json({ erro: 'Acesso negado. Você só pode alterar informações do próprio perfil.' });
            }

            const { nome_completo, email, senha } = req.body;

            if (email) {
                const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
                if (usuarioExistente && usuarioExistente.id !== idUsuarioLogado) {
                    return res.status(400).json({ erro: 'Este e-mail já está vinculado a outra conta.' });
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

            return res.json({
                mensagem: 'Perfil atualizado com sucesso.',
                dados: usuarioAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil.', error);
            return res.status(500).json({ erro: 'Erro interno ao atualizar perfil del usuário.' });
        }
    },

    deletarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const idUsuarioLogado = req.usuario.id;
            const senha = req.headers['confirma-senha'];

            if (!senha) {
                return res.status(400).json({ erro: 'A confirmação de senha é obrigatória. Envie o cabeçalho x-confirma-senha.' });
            }

            if (parseInt(id) !== idUsuarioLogado) {
                return res.status(403).json({ erro: 'Acesso negado. Você só pode deletar o seu próprio perfil.' });
            }

            const usuario = await UsuarioModel.buscarSenhaHash(id);

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Senha incorreta. Operação de exclusão cancelada.' });
            }

            await UsuarioModel.deletarUsuario(id);

            return res.json({ mensagem: 'Sua conta e todos os dados vinculados foram excluídos com sucesso.' });

        } catch (error) {
            console.error('Erro ao deletar perfil:', error);
            return res.status(500).json({ erro: 'Erro interno ao deletar perfil.' });
        }
    }
};

module.exports = usuarioController