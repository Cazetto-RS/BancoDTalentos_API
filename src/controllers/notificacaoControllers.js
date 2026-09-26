const NotificacaoModel = require('../models/notificacaoModels');
const { sucesso, erro404, erro500 } = require('../utils/apiResponse');

const NotificacaoController = {
    listar: async (req, res) => {
        try {
            if (req.usuario.cargo === 'admin' || req.usuario.cargo === 'rh') await NotificacaoModel.garantirResumoSemanal(req.usuario.id);
            return sucesso(res, 200, 'Notificações listadas com sucesso.', await NotificacaoModel.listar(req.usuario.id));
        } catch (error) {
            console.error('Erro ao listar notificações:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },
    marcarLida: async (req, res) => {
        try {
            const notificacao = await NotificacaoModel.marcarLida(req.params.id, req.usuario.id);
            if (!notificacao) return erro404(res, 'Notificação não encontrada.');
            return sucesso(res, 200, 'Notificação marcada como lida.', notificacao);
        } catch (error) {
            console.error('Erro ao atualizar notificação:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },
    marcarTodasLidas: async (req, res) => {
        try {
            const quantidade = await NotificacaoModel.marcarTodasLidas(req.usuario.id);
            return sucesso(res, 200, 'Notificações marcadas como lidas.', { quantidade });
        } catch (error) {
            console.error('Erro ao atualizar notificações:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    }
};

module.exports = NotificacaoController;
