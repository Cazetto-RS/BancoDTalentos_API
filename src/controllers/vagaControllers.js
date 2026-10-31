const vagaModels = require('../models/vagaModels');
const { createToken, validToken } = require('../services/jobShare');
const env = require('../config/env');
const habilidadesVagaModels = require('../models/habilidadesVagaModels');
const db = require('../config/database');
const NotificacaoModel = require('../models/notificacaoModels');
const { sucesso, erro400, erro404, erro409, erro500 } = require('../utils/apiResponse');

const responderErroBanco = (res, error, fallback) => {
    if (error.code === '23503') return erro400(res, 'Área ou habilidade informada não existe.')
    if (error.code === '23505') return erro409(res, 'Esta vaga já possui um vínculo duplicado.')
    if (error.code === '23514') return erro400(res, 'Os dados da vaga não atendem às regras permitidas.')
    return erro500(res, fallback)
}

const vagaControllers = {
    gerarCompartilhamento: async (req, res) => {
        try {
            const vaga = await vagaModels.buscarPorId(req.params.id);
            if (!vaga) return erro404(res, 'Vaga não encontrada.');
            const token = createToken(vaga.id);
            const path = `/vagas/compartilhar/${vaga.id}/${token}`;
            return sucesso(res, 200, 'Link de compartilhamento criado.', { path });
        } catch (error) { console.error('Erro ao gerar compartilhamento:', error); return erro500(res, 'Erro ao gerar link.'); }
    },
    redirecionarCompartilhamento: (req, res) => {
        const { id, token } = req.params;
        if (!validToken(id, token)) return erro404(res, 'Convite inválido ou expirado.');
        // O destino é uma origem autorizada e configurada no servidor, nunca um parâmetro do usuário.
        const origins = env.CORS_ORIGINS.split(',').map(value => value.trim().replace(/^['"]|['"]$/g, ''));
        const origin = origins.find(value => /^https:\/\//.test(value)) || origins.find(value => /^http:\/\/localhost/.test(value));
        if (!origin) return erro500(res, 'Endereço público do frontend não configurado.');
        const target = new URL('/vagas-abertas', origin);
        target.searchParams.set('vaga', String(id));
        target.searchParams.set('convite', token);
        res.set('Cache-Control', 'no-store');
        res.set('Referrer-Policy', 'no-referrer');
        return res.redirect(302, target.toString());
    },
    buscarPorConvite: async (req, res) => {
        const { id, token } = req.params;
        if (!validToken(id, token)) return erro404(res, 'Convite inválido ou expirado.');
        try {
            const vaga = await vagaModels.buscarPorId(id);
            if (!vaga || vaga.status !== 'ativo') return erro404(res, 'Vaga não disponível.');
            const habilidades = await habilidadesVagaModels.buscarPorVaga(id);
            return sucesso(res, 200, 'Vaga disponível por convite.', { ...vaga, habilidades: habilidades || [] });
        } catch (error) { console.error('Erro ao buscar vaga por convite:', error); return erro500(res, 'Erro ao carregar vaga.'); }
    },
    criarVaga: async (req, res) => {
        try {
            const { habilidades = [], ...dadosVaga } = req.body;

            const client = await db.pool.connect();
            try {
                await client.query('BEGIN');
                const novaVaga = await vagaModels.criarVaga(dadosVaga, client);
                const habilidadesInseridas = [];
                for (const hab of habilidades) {
                    const vinculo = await habilidadesVagaModels.vincularVaga(novaVaga.id, hab.habilidade_id, hab.obrigatoria, client);
                    habilidadesInseridas.push(vinculo);
                }
                await client.query('COMMIT');
                return sucesso(res, 201, 'Vaga cadastrada com sucesso.', { ...novaVaga, habilidades: habilidadesInseridas });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Erro ao criar vaga:', error);
            return responderErroBanco(res, error, 'Erro interno no servidor.');
        }
    },

    buscarTodos: async (req, res) => {
        try {
            const vagas = await vagaModels.buscarTodos({ somenteAtivas: true });
            return sucesso(
                res,
                200,
                'Vagas listadas com sucesso.',
                vagas
            );
        } catch (error) {
            console.error('Erro ao listar vagas:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const vagas = await vagaModels.buscarPorId(id, { somenteAtiva: true });

            if (!vagas) {
                return erro404(res, 'Vaga não encontrada.');
            }

            const habilidades = await habilidadesVagaModels.buscarPorVaga(id);

            return sucesso(
                res,
                200,
                'Vaga encontrada com sucesso.',
                {
                    ...vagas,
                    habilidades: habilidades || []
                }
            );
        } catch (error) {
            console.error('Erro ao buscar vaga por ID:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarTodasAdmin: async (req, res) => {
        try {
            const vagas = await vagaModels.buscarTodos();
            return sucesso(res, 200, 'Vagas listadas com sucesso.', vagas);
        } catch (error) {
            console.error('Erro ao listar vagas para administração:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    editarVaga: async (req, res) => {
        try {
            const { id } = req.params;
            const { habilidades, ...dadosVaga } = req.body;
            const client = await db.pool.connect();
            try {
                await client.query('BEGIN');
                const vagaAtualizada = await vagaModels.atualizarVaga(id, dadosVaga, client);
                if (!vagaAtualizada) {
                    await client.query('ROLLBACK');
                    return erro404(res, 'Vaga não encontrada.');
                }
                if (habilidades !== undefined) {
                    await habilidadesVagaModels.removerTodosDaVaga(id, client);
                    for (const hab of habilidades) {
                        await habilidadesVagaModels.vincularVaga(id, hab.habilidade_id, hab.obrigatoria, client);
                    }
                }
                await client.query('COMMIT');
                const habilidadesAtualizadas = await habilidadesVagaModels.buscarPorVaga(id);
                if (dadosVaga.status === 'pausado' || dadosVaga.status === 'fechado') {
                    try {
                        await NotificacaoModel.criarParaFuncionarios('alerta_vaga', 'Status de vaga alterado', `A vaga “${vagaAtualizada.titulo}” foi marcada como ${dadosVaga.status}.`, { vaga_id: Number(id), status: dadosVaga.status, autor_id:req.usuario.id, autor_nome:req.usuario.nome_completo || req.usuario.email, autor_email:req.usuario.email });
                    } catch (notificationError) { console.error('Vaga atualizada, mas a notificação falhou:', notificationError); }
                }
                return sucesso(res, 200, 'Vaga atualizada com sucesso.', { ...vagaAtualizada, habilidades: habilidadesAtualizadas });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Erro ao editar vaga:', error);
            return responderErroBanco(res, error, 'Erro interno no servidor.');
        }
    },

    deletarVaga: async (req, res) => {
        const client = await db.pool.connect();
        try {
            const { id } = req.params;
            await client.query('BEGIN');
            const deletada = await vagaModels.excluirVaga(id, client);

            if (!deletada) {
                await client.query('ROLLBACK');
                return erro404(res, 'Vaga não encontrada ou já excluída.');
            }

            await client.query('COMMIT');

            return sucesso(
                res,
                200,
                'Vaga deletada com sucesso!'
            );
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro deletar vaga', error);
            return erro500(res, 'Erro interno no servidor.');
        } finally {
            client.release();
        }
    }
};

module.exports = vagaControllers;
