const vagaModels = require('../models/vagaModels');
const habilidadesVagaModels = require('../models/habilidadesVagaModels');
const { sucesso, erro400, erro404, erro500 } = require('../utils/apiResponse');

const vagaControllers = {
    criarVaga: async (req, res) => {
        try {
            const { titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status, habilidades } = req.body;

            if (modelo_trabalho && !['remoto', 'hibrido', 'presencial'].includes(modelo_trabalho)) {
                return erro400(res, 'Modelo de trabalho inválido. Use: remoto, hibrido ou presencial.');
            }

            if (tipo_contrato && !['CLT', 'PJ'].includes(tipo_contrato)) {
                return erro400(res, 'Tipo de contrato inválido. Use: PJ ou CLT.');
            }

            const novaVaga = await vagaModels.criarVaga({ 
                titulo, 
                descricao, 
                modelo_trabalho, 
                tipo_contrato, 
                salario_min, 
                salario_max, 
                status 
            });

            let habilidadesInseridas = [];
            if (habilidades && Array.isArray(habilidades)) {
                for (const hab of habilidades) {
                    if (hab.habilidade_id) {
                        const vinculo = await habilidadesVagaModels.vincularVaga(novaVaga.id, hab.habilidade_id, hab.obrigatoria);
                        habilidadesInseridas.push(vinculo);
                    }
                }
            }

            return sucesso(
                res,
                201,
                'Vaga cadastrada com sucesso!',
                {
                    ...novaVaga,
                    habilidades: habilidadesInseridas
                }
            );
        } catch (error) {
            console.error('Erro ao criar vaga:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    buscarTodos: async (req, res) => {
        try {
            const vagas = await vagaModels.buscarTodos();
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
            const vagas = await vagaModels.buscarPorId(id);

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

    editarVaga: async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status, habilidades } = req.body;

            if (modelo_trabalho && !['remoto', 'hibrido', 'presencial'].includes(modelo_trabalho)) {
                return erro400(res, 'Modelo de trabalho inválido. Use: remoto, hibrido ou presencial.');
            }

            if (tipo_contrato && !['CLT', 'PJ'].includes(tipo_contrato)) {
                return erro400(res, 'Tipo de contrato inválido. Use: PJ ou CLT.');
            }

            if (status && !['ativo', 'pausado', 'fechado'].includes(status)) {
                return erro400(res, 'Status inválido. Use: ativo, pausado ou fechado.');
            }

            const vagasAtualizadas = await vagaModels.atualizarVaga(id, { 
                titulo, 
                descricao, 
                modelo_trabalho, 
                tipo_contrato, 
                salario_min, 
                salario_max, 
                status 
            });

            if (!vagasAtualizadas) {
                return erro404(res, 'Vaga não encontrada.');
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

            return sucesso(
                res,
                200,
                'Vaga atualizada com sucesso!',
                {
                    ...vagasAtualizadas,
                    habilidades: habilidadesAtualizadas
                }
            );
        } catch (error) {
            console.error('Erro ao editar vaga:', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    },

    deletarVaga: async (req, res) => {
        try {
            const { id } = req.params;
            const deletada = await vagaModels.excluirVaga(id);

            if (!deletada) {
                return erro404(res, 'Vaga não encontrada ou já excluída.');
            }

            return sucesso(
                res,
                200,
                'Vaga deletada com sucesso!'
            );
        } catch (error) {
            console.error('Erro deletar vaga', error);
            return erro500(res, 'Erro interno no servidor.');
        }
    }
};

module.exports = vagaControllers;