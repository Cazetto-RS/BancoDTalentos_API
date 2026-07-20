const db = require('../config/database');

const HabilidadesCandidatosModels = {
    buscarCandidatoIdPorUsuario: async (usuario_id) => {
        const queryText = `SELECT id FROM candidatos WHERE usuario_id = $1`;
        const { rows } = await db.query(queryText, [usuario_id]);
        return rows[0] ? rows[0].id : null;
    },

    vincularCandidato: async (candidato_id, habilidade_id, { nivel, nivel_experiencia }) => {
        const queryText = `
        INSERT INTO habilidades_candidato (candidato_id, habilidade_id, nivel, nivel_experiencia)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (candidato_id, habilidade_id)
        DO UPDATE SET
            nivel = COALESCE($3, habilidades_candidato.nivel),
            nivel_experiencia = COALESCE($4, habilidades_candidato.nivel_experiencia)
        RETURNING *
        `;

        const { rows } = await db.query(queryText, [
            candidato_id,
            habilidade_id,
            nivel || null,
            nivel_experiencia || null
        ]);
        return rows[0];
    },

    buscarPorCandidato: async (candidato_id) => {
        const queryText = `
        SELECT hc.habilidade_id, h.nome, h.categoria, hc.nivel, hc.nivel_experiencia
        FROM habilidades_candidato hc
        JOIN habilidades h ON hc.habilidade_id = h.id
        WHERE hc.candidato_id = $1
        ORDER BY hc.nivel DESC
        `;
        const { rows } = await db.query(queryText, [candidato_id]);
        return rows;
    },

    desvincular: async (candidato_id, habilidade_id) => {
        const queryText = `
        DELETE FROM habilidades_candidato
        WHERE candidato_id = $1 AND habilidade_id = $2
        RETURNING *
        `;
        const { rows } = await db.query(queryText, [candidato_id, habilidade_id]);
        return rows[0];
    },

    removerTodasDoCandidato: async (candidato_id) => {
        await db.query('DELETE FROM habilidades_candidato WHERE candidato_id = $1', [candidato_id]);
    }
};

module.exports = HabilidadesCandidatosModels;