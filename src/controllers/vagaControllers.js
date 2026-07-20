const vagaModels = require('../models/vagaModels');
const habilidadesVagaModels = require('../models/habilidadesVagaModels');

const vagaControllers = {
    criarVaga: async (req, res) => {
        try {
            const { titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status, habilidades } = req.body;

            if (modelo_trabalho && !['remoto', 'hibrido', 'presencial'].includes(modelo_trabalho)) {
                return res.status(400).json({ erro: 'Modelo de trabalho inválido. Use: remoto, hibrido ou presencial.' });
            }

            if (tipo_contrato && !['CLT', 'PJ'].includes(tipo_contrato)) {
                return res.status(400).json({ erro: 'Tipo de contrato inválido. Use: PJ ou CLT.' });
            }

            const novaVaga = await vagaModels.criarVaga({ titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status });

            let habilidadesInseridas = [];
            if (habilidades && Array.isArray(habilidades)) {
                for (const hab of habilidades) {
                    if (hab.habilidade_id) {
                        const vinculo = await habilidadesVagaModels.vincularVaga(novaVaga.id, hab.habilidade_id, hab.obrigatoria);
                        habilidadesInseridas.push(vinculo);
                    }
                }
            }

            return res.status(201).json({
                mensagem: 'Vaga cadastrada com sucesso!',
                dados: {
                    ...novaVaga,
                    habilidades: habilidadesInseridas
                }
            });
        } catch (error) {
            console.error('Erro ao criar vaga:', error);
            return res.status(500).json({ erro: 'Erro interno ao criar vaga.' });
        }
    },

    buscarTodos: async (req, res) => {
        try {
            const vagas = await vagaModels.buscarTodos();
            return res.json(vagas);
        } catch (error) {
            console.error('Erro ao listar vagas:', error);
            return res.status(500).json({ erro: 'Erro interno ao listar vagas.' });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const vagas = await vagaModels.buscarPorId(id);

            if (!vagas) {
                return res.status(404).json({ erro: 'Vaga não encontrada.' });
            }

            const habilidades = await habilidadesVagaModels.buscarPorVaga(id);

            return res.json({
                ...vagas,
                habilidades: habilidades || []
            });
        } catch (error) {
            console.error('Erro ao buscar vaga por ID:', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar vaga por ID.' });
        }
    },

    editarVaga: async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status, habilidades } = req.body;

            if (modelo_trabalho && !['remoto', 'hibrido', 'presencial'].includes(modelo_trabalho)) {
                return res.status(400).json({ erro: 'Modelo de trabalho inválido. Use: remoto, hibrido ou presencial.' });
            }

            if (tipo_contrato && !['CLT', 'PJ'].includes(tipo_contrato)) {
                return res.status(400).json({ erro: 'Tipo de contrato inválido. Use: PJ ou CLT.' });
            }

            if (status && !['ativo', 'pausado', 'fechado'].includes(status)) {
                return res.status(400).json({ erro: 'Status inválido. Use: ativo, pausado ou fechado.' });
            }

            const vagasAtualizadas = await vagaModels.atualizarVaga(id, { titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status, });

            if (!vagasAtualizadas) {
                return res.status(404).json({ erro: 'Vaga não encontrada.' });
            }

            if (habilidades && Array.isArray(habilidades)) {
                await habilidadesVagaModels.removerTodosDaVaga(id);
                for (const hab of habilidades) {
                    if (hab.habilidade_id) {
                        await habilidadesVagaModels.vincularVaga(id, hab.habilidade_id, hab.obrigatoria);
                    }
                }
            }

            const habilidadesAtualizadas = await habilidadesVagaModels.buscarPorVaga(id);

            return res.json({
                mensagem: 'Vaga atualizada com sucesso!',
                dados: {
                    ...vagasAtualizadas,
                    habilidades: habilidadesAtualizadas
                }
            });
        } catch (error) {
            console.error('Erro ao editar vaga:', error);
            return res.status(500).json({ erro: 'Erro interno ao editar vaga.' });
        }
    },

    deletarVaga: async (req, res) => {
        try {
            const { id } = req.params;
            const deletada = await vagaModels.excluirVaga(id);

            if (!deletada) {
                return res.status(404).json({ erro: 'Vaga não encontrada ou já excluida.' });
            }

            return res.json({ mensagem: 'Vaga deletada com sucesso!' });
        } catch (error) {
            console.error('Erro deletar vaga', error);
            return res.status(500).json({ erro: 'Erro interno ao deletar vaga.' });
        }
    }
};

module.exports = vagaControllers;