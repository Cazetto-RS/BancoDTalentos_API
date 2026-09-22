const db = require('../config/database');

const HabilidadesVagaModels = {
    vincularVaga: async (vaga_id, habilidade_id, obrigatoria, executor = db) => {
        const queryText = `
        INSERT INTO habilidades_vaga (vaga_id, habilidade_id, obrigatoria)
        VALUES ($1, $2, $3)
        ON CONFLICT (vaga_id, habilidade_id)
        DO UPDATE SET obrigatoria = $3
        RETURNING *
        `;
        const {rows} = await executor.query(queryText, [vaga_id, habilidade_id, obrigatoria ?? true]);
        return rows[0];
    },

    buscarPorVaga: async (vaga_id) => {
        const queryText = `
        SELECT hv.habilidade_id, h.nome, h.categoria, hv.obrigatoria
        FROM habilidades_vaga hv
        JOIN habilidades h ON hv.habilidade_id = h.id
        WHERE hv.vaga_id = $1
        `;
        const {rows} = await db.query(queryText, [vaga_id]);
        return rows;
    },

    removerTodosDaVaga: async (vaga_id, executor = db) => {
        const { rows } = await executor.query('DELETE FROM habilidades_vaga WHERE vaga_id = $1 RETURNING id', [vaga_id]);
        return rows;
    }
};

module.exports = HabilidadesVagaModels
