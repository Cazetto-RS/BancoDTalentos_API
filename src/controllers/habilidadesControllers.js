const HabilidadesModels = require('../models/habilidadesModels');

const HabilidadesControllers = {
    criar: async (req, res) => {
        try {
            const {nome, categoria} = req.body;
            if (!nome || !categoria) {
                return res.status(400).json({erro: 'Nome e categoria são campos obrigatórios.'});
            }

            if (!['hard', 'soft'].includes(categoria)) {
                return res.status(400).json({erro: 'Valor inválido.'});
            }

            const nova = await HabilidadesModels.criar({nome, categoria});
            return res.status(201).json(nova);
        } catch (error) {
            if (error.code === '23505') return res.status(400).json({erro: 'Está habilidade já está cadastrada.'});
            return res.status(500).json({erro: 'Erro interno no servidor.'}); 
        }
    },

    buscarTodas: async (req, res) => {
        try {
            const lista = await HabilidadesModels.buscarTodos();
            return res.json(lista);
        } catch (error) {
            return res.status(500).json({erro: 'Erro ao listar habilidades.'});
        }
    },

    editar: async (req, res) => {
        try {
            const {id} = req.params;
            const {nome, categoria} = req.body;

            const atualizada = await HabilidadesModels.atualizar(id, {nome, categoria});
            if (!atualizada) {
                return res.status(404).json({erro: 'Habilidade não encontrada.'});
            }

            return res.json({
                mensagem: 'Habilidade atualizada com sucesso!',
                dados: atualizada
            });
            
        } catch (error) {
            return res.status(500).json({erro: 'Erro ao editar habilidade.'});
        }
    },

    deletar: async (req, res) => {
        try {
            const {id} = req.params;

            const deletado = await HabilidadesModels.deletar(id);
            if (!deletado) {
                return res.status(404).json({erro: 'Habilidade não encontrada'});
            }

            return res.json({
                mensagem: 'Habilidades excluída com sucesso!'
            });
        } catch (error) {
            return res.status(500).json({erro: 'Erro ao deletar'});
        }
    }
};

module.exports = HabilidadesControllers;