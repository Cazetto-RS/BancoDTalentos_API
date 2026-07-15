const db = require('../config/database');

const HabilidadesVagaModels = {
    vincularVaga: async (vaga_id, habilidades_id, obrigatoria) => {
        const queryText = `
        INSERT INTO habilidades_vaga (vaga_id, habilidades_id, obrigatoria)
        VALUES ($1, $2, $3)
        ON CONFLICT (vaga_id, habilidade_id)
        DO UPDATE SET obrigatoria = $3
        RETURNING *
        `;
        const {rows} = await db.query(queryText, [vaga_id, habilidades_id, obrigatoria !== undefined ? obrigatoria : false]);
        return rows[0];
    },

    buscarPorVaga: async (vaga_id) => {
        const queryText = `
        SELECT hv.habilidades, h.nome, h.catgoria, hv.obrigatoria
        FROM habilidades_vagas hv
        JOIN habilidades h ON hv.habilidade_id = h.id
        WHERE hv.vaga_id = $1
        `;
    },

    removerTodosDaVaga: async (vaga_id) => {
        await db.query('DELETE FROM habilidades_vaga WHERE vaga_id = $1', [vaga_id]);
    }
};

module.exports = HabilidadesVagaModels