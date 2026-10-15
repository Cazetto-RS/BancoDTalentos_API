const UsuarioModel = require('../models/usuarioModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const crypto = require('node:crypto');
const CodigoEmailModel = require('../models/codigoEmailModels');
const CadastroPendenteModel = require('../models/cadastroPendenteModels');
const { enviarCodigo } = require('../services/emailService');
const { sucesso, erro400, erro401, erro403, erro404, erro409, erro500 } = require('../utils/apiResponse');

const gerarCodigo = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
const hashCodigo = (email, finalidade, codigo) => crypto
    .createHmac('sha256', env.EMAIL_CODE_SECRET || 'test-email-code-secret-with-32-characters')
    .update(`${email.toLowerCase()}:${finalidade}:${codigo}`)
    .digest('hex');

async function criarEEnviarCodigo(usuario, finalidade, ignorarIntervalo = false) {
    if (!ignorarIntervalo) {
        const permitido = await CodigoEmailModel.podeReenviar(
            usuario.email,
            finalidade,
            env.EMAIL_CODE_RESEND_SECONDS
        );
        if (!permitido) return false;
    }
    const codigo = gerarCodigo();
    const expiraEm = new Date(Date.now() + env.EMAIL_CODE_TTL_MINUTES * 60_000);
    await CodigoEmailModel.substituir({
        usuario_id: usuario.id || null,
        email: usuario.email,
        codigo_hash: hashCodigo(usuario.email, finalidade, codigo),
        finalidade,
        expira_em: expiraEm
    });
    await enviarCodigo({ email: usuario.email, nome: usuario.nome_completo, codigo, finalidade });
    return true;
}

async function validarCodigo(email, finalidade, codigo) {
    const registro = await CodigoEmailModel.buscarAtivo(email, finalidade);
    if (!registro || new Date(registro.expira_em).getTime() <= Date.now()) {
        return { valido: false, mensagem: 'Código inválido ou expirado.' };
    }
    if (registro.tentativas >= env.EMAIL_CODE_MAX_ATTEMPTS) {
        return { valido: false, mensagem: 'Limite de tentativas atingido. Solicite outro código.' };
    }
    const recebido = Buffer.from(hashCodigo(email, finalidade, codigo), 'hex');
    const armazenado = Buffer.from(registro.codigo_hash, 'hex');
    if (recebido.length !== armazenado.length || !crypto.timingSafeEqual(recebido, armazenado)) {
        await CodigoEmailModel.registrarFalha(registro.id);
        return { valido: false, mensagem: 'Código inválido ou expirado.' };
    }
    return { valido: true, registro };
}

async function autenticarUsuario(usuario) {
    const token = jwt.sign(
        { id: usuario.id, nome_completo: usuario.nome_completo, email: usuario.email, cargo: usuario.cargo },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
    await UsuarioModel.criarSessao(usuario.id, token);
    return {
        token,
        usuario: {
            id: usuario.id,
            nome_completo: usuario.nome_completo,
            email: usuario.email,
            cargo: usuario.cargo,
            criado_em: usuario.criado_em,
            consentimento_talentos: usuario.consentimento_talentos
        }
    };
}

const usuarioController = {
    registrarCandidato: async (req, res) => {
        try {
            const { nome_completo, email, senha } = req.body;

            if (!nome_completo || !email || !senha) {
                return erro400(res, 'Nome, e-mail e senha são campos obrigatórios');
            }

            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return erro409(res, 'Este e-mail já está vinculado a um perfil.');
            }

            const salt = await bcrypt.genSalt(10);
            const senha_hash = await bcrypt.hash(senha, salt);

            const cadastroPendente = await CadastroPendenteModel.salvar({ nome_completo, email, senha_hash });

            await criarEEnviarCodigo(cadastroPendente, 'verificar_email', true);

            return sucesso(
                res,
                201,
                'Enviamos um código de confirmação para seu e-mail.',
                { email: cadastroPendente.email, expira_em_minutos: env.EMAIL_CODE_TTL_MINUTES }
            );
        } catch (error) {
            console.error('Erro ao registrar novo candidato... :', error);
            if (error.code === '23505') return erro409(res, 'Este e-mail já está vinculado a um perfil.');
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    verificarEmail: async (req, res) => {
        try {
            const { email, codigo } = req.body;
            const cadastroPendente = await CadastroPendenteModel.buscar(email);
            if (!cadastroPendente) return erro400(res, 'Código inválido ou expirado.');
            const resultado = await validarCodigo(email, 'verificar_email', codigo);
            if (!resultado.valido) return erro400(res, resultado.mensagem);
            const usuario = await CadastroPendenteModel.confirmar(email, resultado.registro.id);
            if (!usuario) return erro400(res, 'Código inválido, expirado ou já utilizado.');
            const autenticacao = await autenticarUsuario(usuario);
            return sucesso(res, 201, 'E-mail confirmado e conta criada com sucesso.', autenticacao);
        } catch (error) {
            console.error('Erro ao confirmar e-mail:', error);
            return erro500(res, 'Não foi possível confirmar o e-mail.');
        }
    },

    reenviarCodigo: async (req, res) => {
        try {
            const cadastroPendente = await CadastroPendenteModel.buscar(req.body.email);
            if (!cadastroPendente) {
                return sucesso(res, 200, 'Se houver um cadastro pendente, enviaremos um novo código.');
            }
            const enviado = await criarEEnviarCodigo(cadastroPendente, 'verificar_email');
            if (!enviado) return erro400(res, `Aguarde ${env.EMAIL_CODE_RESEND_SECONDS} segundos antes de reenviar.`);
            return sucesso(res, 200, 'Novo código enviado.');
        } catch (error) {
            console.error('Erro ao reenviar código:', error);
            return erro500(res, 'Não foi possível enviar o código.');
        }
    },

    solicitarRecuperacao: async (req, res) => {
        const resposta = () => sucesso(res, 200, 'Se o e-mail estiver cadastrado, enviaremos um código de recuperação.');
        try {
            const usuario = await UsuarioModel.buscarPorEmail(req.body.email);
            if (!usuario || !usuario.email_verificado_em || usuario.exclusao_agendada_em) return resposta();
            const permitido = await CodigoEmailModel.podeReenviar(
                usuario.email,
                'redefinir_senha',
                env.EMAIL_CODE_RESEND_SECONDS
            );
            if (!permitido) return resposta();
            await criarEEnviarCodigo(usuario, 'redefinir_senha', true);
            return resposta();
        } catch (error) {
            console.error('Erro ao solicitar recuperação:', error);
            return resposta();
        }
    },

    redefinirSenha: async (req, res) => {
        try {
            const { email, codigo, nova_senha } = req.body;
            const usuario = await UsuarioModel.buscarPorEmail(email);
            if (!usuario || !usuario.email_verificado_em || usuario.exclusao_agendada_em) {
                return erro400(res, 'Código inválido ou expirado.');
            }
            const resultado = await validarCodigo(email, 'redefinir_senha', codigo);
            if (!resultado.valido) return erro400(res, resultado.mensagem);
            const consumido = await CodigoEmailModel.marcarUsado(resultado.registro.id);
            if (!consumido) return erro400(res, 'Código inválido ou já utilizado.');
            const senha_hash = await bcrypt.hash(nova_senha, 10);
            await UsuarioModel.redefinirSenha(usuario.id, senha_hash);
            return sucesso(res, 200, 'Senha alterada com sucesso. Entre novamente.');
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return erro500(res, 'Não foi possível alterar a senha.');
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
            const { email, senha: senhaFornecida } = req.body;

            if (!email || !senhaFornecida) {
                return erro400(res, 'E-mail e senha são campos obrigatórios.');
            }

            const usuario = await UsuarioModel.buscarPorEmail(email);
            if (!usuario) {
                return erro401(res, 'E-mail ou senha inválidos.');
            }
            if (usuario.exclusao_agendada_em) return erro403(res, 'Esta conta está inativa e agendada para exclusão.');

            const senhaValida = await bcrypt.compare(senhaFornecida, usuario.senha_hash);
            if (!senhaValida) {
                return erro401(res, 'E-mail ou senha inválidos.');
            }
            if (usuario.cargo === 'candidato' && !usuario.email_verificado_em) {
                return erro403(res, 'Confirme seu e-mail antes de entrar.');
            }

            const token = jwt.sign(
                { id: usuario.id, nome_completo: usuario.nome_completo, email: usuario.email, cargo: usuario.cargo },
                env.JWT_SECRET,
                { expiresIn: env.JWT_EXPIRES_IN }
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
                        cargo: usuario.cargo,
                        criado_em: usuario.criado_em,
                        consentimento_talentos: usuario.consentimento_talentos
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
                return erro409(res, 'Já existe um usuário com este e-mail.');
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
            if (error.code === '23505') return erro409(res, 'Já existe um usuário com este e-mail.');
            return erro500(res, 'Erro interno no servidor.');
        }
    },
    atualizarConsentimento: async (req, res) => {
        try { const atualizado=await UsuarioModel.atualizarConsentimento(req.usuario.id, req.body.consentimento_talentos); if(!atualizado)return erro404(res,'Candidato não encontrado.'); return sucesso(res,200,'Preferência atualizada.',atualizado); }
        catch(error){console.error('Erro ao atualizar consentimento:',error);return erro500(res,'Erro interno no servidor.');}
    },
    listarBancoTalentos: async (_req,res) => {
        try{return sucesso(res,200,'Banco de talentos listado.',await UsuarioModel.listarBancoTalentos());}catch(error){console.error(error);return erro500(res,'Erro interno no servidor.');}
    },
    solicitarExclusao: async (req,res) => {
        try { const registro=await UsuarioModel.buscarSenhaHash(req.usuario.id); if(!registro||!(await bcrypt.compare(req.body.senha,registro.senha_hash)))return erro401(res,'Senha inválida.'); const agendada=await UsuarioModel.agendarExclusao(req.usuario.id); return sucesso(res,200,'Conta inativada e agendada para exclusão em 7 dias.',agendada); }
        catch(error){console.error(error);return erro500(res,'Erro interno no servidor.');}
    },
    solicitarExclusaoAdmin: async (req,res) => {
        try { const registro=await UsuarioModel.buscarSenhaHash(req.usuario.id); if(!registro||!(await bcrypt.compare(req.body.senha,registro.senha_hash)))return erro401(res,'Senha do administrador inválida.'); if(Number(req.params.id)===req.usuario.id)return erro400(res,'Use a exclusão da própria conta nas configurações.'); const agendada=await UsuarioModel.agendarExclusao(req.params.id); if(!agendada)return erro404(res,'Usuário não encontrado.'); return sucesso(res,200,'Conta inativada e agendada para exclusão em 7 dias.',agendada); }
        catch(error){console.error(error);return erro500(res,'Erro interno no servidor.');}
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
            if (error.code === '23505') return erro409(res, 'Este e-mail já está vinculado a outra conta.');
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    deletarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const idUsuarioLogado = req.usuario.id;
            const senha = req.body.senha || req.headers['confirma-senha'];

            if (!senha) {
                return erro400(res, 'A confirmação de senha é obrigatória.');
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
    },

    logout: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            await UsuarioModel.encerrarSessao(req.usuario.id, token);
            return sucesso(res, 200, 'Logout realizado com sucesso.');
        } catch (error) {
            console.error('Erro ao realizar logout:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    }
};

module.exports = usuarioController;
