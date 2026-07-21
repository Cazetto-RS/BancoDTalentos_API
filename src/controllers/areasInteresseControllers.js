const AreasInteresseModels = require('../models/areasInteresseModels');

const AreasInteresseController = {
    criar: async (req, res) => {
        try {
            const {nome} = req.body;
            if (!nome) {
                return res.status(400).json({erro: 'Nome é um campos obrigatório.'});
            }

            const novaArea = await AreasInteresseModels.criar({nome});
            return res.status(201).json(novaArea);
        } catch (error) {
            if (error.code === '23505') return res.status(400).json({erro: 'Está área já está cadastrada.'});
            return res.status(500).json({erro: 'Erro interno no servidor.'}); 
        }
    },

    buscarTodas: async (req, res) => {
        try {
            const lista = await AreasInteresseModels.buscarTodos();
            return res.json(lista);
        } catch (error) {
            console.error('Erro ao buscar áreas:', error)
            return res.status(500).json({erro: 'Erro interno no servidor.'}); 
        }
    },

    editar: async (req, res) => {
        try {
            const {id} = req.params;
            const {nome} = req.body;

            const atualizada = await AreasInteresseModels.atualizar(id, {nome});
            if (!atualizada) {
                return res.status(404).json({erro: 'Área não encontrada.'});
            }

            return res.json({
                mensagem: 'Área atualizada com sucesso.',
                dados: atualizada
            });  
        } catch (error) {
            console.error('Erro ao atualizar área:', error)
            return res.status(500).json({erro: 'Erro interno no servidor.'}); 
        }
    },
    
    deletar: async (req, res) => {
        try {
            const {id} = req.params;

            const deletada = await AreasInteresseModels.deletar(id);
            if (!deletada) {
                return res.status(404).json({erro: 'Área não encontrada'});
            }

            return res.json({
                mensagem: 'Área deletada com sucesso.'
            })
        } catch (error) {
            console.error('Erro ao deletar área:', error)
            return res.status(500).json({erro: 'Erro interno no servidor.'}); 
        }
    }
};

module.exports = AreasInteresseController;