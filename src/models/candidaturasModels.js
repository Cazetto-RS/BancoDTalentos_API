const db = require('../config/database');

const CandidaturaModels = {
    inscrever: async ({vaga_id, candidato_id, pretensao_salarial, disponibilidade, preferencia_contrato, preferencia_modelo_trabalho}) => {
        const queryText = `
        INSERT INTO candidaturas (vaga_id, candidato_id, pretensao_salarial, disponibilidade, preferencia_contrato, preferencia_modelo_trabalho)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`;
        const values = [vaga_id, candidato_id, pretensao_salarial || null, disponibilidade || null, preferencia_contrato || null, preferencia_modelo_trabalho || null];
        const {rows} = await db.query(queryText, values);
        return rows[0];
    },

    listarPorCandidato: async (vaga_id) => {
        const queryText = `
        SELECT c.*, v.titulo as vaga_titulo, v.modelo_trabalho as vaga_modelo, v.tipo_contrato as vaga_contrato
        FROM candidaturas c
        JOIN vagas v ON c.vaga_id = v.id
        WHERE c.candidato_id = $1
        ORDER BY c.criado_em DESC;
        `;
        const {rows} = await db.query(queryText, [vaga_id]);
        return rows;
    },

    listarPorVaga: async (vaga_id) => {
        const queryText = `
        SELECT 
                c.id as candidatura_id,
                c.status as candidatura_status,
                c.favorito,
                c.pretensao_salarial,
                c.disponibilidade,
                c.preferencia_contrato,
                c.preferencia_modelo_trabalho,
                c.criado_em as data_inscricao,
                u.nome_completo as candidato_nome,
                u.email as candidato_email
        FROM candidaturas c
        JOIN candidatos cand ON c.candidato_id = cand.id
        JOIN usuarios u ON cand.usuario_id = u.id
        WHERE c.vaga_id = $1
        ORDER BY c.criado_em DESC;
        `;
        const {rows} = await db.query(queryText, [vaga_id]);
        return rows;
    },

    atualizarStatus: async (id, status, favorito) => {
        const queryText = `
        UPDATE candidaturas
        SET
            status = COALESCE ($2, status),
            favorito = COALESCE ($3, favorito)
        WHERE id = $1
        RETURNING *`;
        const {rows} = await db.query(queryText, [id, status || null, favorito || null]);
        return rows[0];
    },

    listarTodas: async () => {
        const queryText = `
        SELECT 
                c.id as candidatura_id,
                c.status as candidatura_status,
                c.favorito,
                c.pretensao_salarial,
                c.disponibilidade,
                c.preferencia_contrato,
                c.preferencia_modelo_trabalho,
                c.criado_em as data_inscricao,
                v.id as vaga_id,
                v.titulo as vaga_titulo,
                u.nome_completo as candidato_nome,
                u.email as candidato_email
        FROM candidaturas c
        JOIN vagas v ON c.vaga_id = v.id
        JOIN candidatos cand ON c.candidato_id = cand.id
        JOIN usuarios u ON cand.usuario_id = u.id
        ORDER BY c.criado_em DESC;
        `
        const {rows} = await db.query(queryText);
        return rows;
    }
};

module.exports = CandidaturaModels;