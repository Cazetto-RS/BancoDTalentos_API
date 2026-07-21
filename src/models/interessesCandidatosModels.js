const db = require('../config/database');

const interesseCandidatosModels = {
buscarCandidatoIdPorUsuario: async (usuario_id) => {
        const queryText = `SELECT id FROM candidatos WHERE usuario_id = $1`;
        const { rows } = await db.query(queryText, [usuario_id]);
        return rows[0] ? rows[0].id : null;
    },

    vincularArea: async (candidato_id, interesse_id) => {
        const queryText = `
        INSERT INTO interesses_candidato (candidato_id, interesse_id)
        VALUES ($1, $2)
        ON CONFLICT (candidato_id, interesse_id) DO NOTHING
        RETURNING *
        `;
        const { rows } = await db.query(queryText, [candidato_id, interesse_id]);
        return rows[0];
    },

    buscarPorCandidato: async (candidato_id) => {
        const queryText = `
        SELECT ic.interesse_id, ai.nome
        FROM interesses_candidato ic
        JOIN areas_interesse ai ON ic.interesse_id = ai.id
        WHERE ic.candidato_id = $1
        ORDER BY ai.nome ASC
        `;
        const { rows } = await db.query(queryText, [candidato_id]);
        return rows;
    },

    desvincularArea: async (candidato_id, interesse_id) => {
        const queryText = `
        DELETE FROM interesses_candidato
        WHERE candidato_id = $1 AND interesse_id = $2
        RETURNING *
        `;
        const { rows } = await db.query(queryText, [candidato_id, interesse_id]);
        return rows[0];
    }
};

module.exports = interesseCandidatosModels;