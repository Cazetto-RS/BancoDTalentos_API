const db = require('../config/database');

const CandidaturaModels = {
    inscrever: async ({vaga_id, candidato_id, pretensao_salarial, disponibilidade, preferencia_contrato, preferencia_modelo_trabalho}) => {
        const queryText = `
        INSERT INTO candidaturas (vaga_id, candidato_id, pretensao_salarial, disponibilidade, preferencia_contrato, preferencia_modelo_trabalho)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`;
        const values = [vaga_id, candidato_id, pretensao_salarial ?? null, disponibilidade ?? null, preferencia_contrato ?? null, preferencia_modelo_trabalho ?? null];
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
        const {rows} = await db.query(queryText, [id, status ?? null, favorito ?? null]);
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
                v.area_interesse_id,
                ai.nome as area_nome,
                cand.id as candidato_id,
                cand.usuario_id,
                u.nome_completo as candidato_nome,
                u.email as candidato_email,
                cand.telefone, cand.cidade, cand.estado, cand.data_nascimento, cand.url_foto,
                cand.linkedin_url, cand.portfolio_url, cand.curriculo_url, cand.cargo_desejado,
                cand.criado_em as candidato_criado_em,
                cc.motivacao, cc.descricao_valores, cc.apresentacao, cc.arquivo_recomendacao,
                COALESCE((
                    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
                        'nome', h.nome,
                        'categoria', h.categoria,
                        'nivel', hc.nivel,
                        'nivel_experiencia', hc.nivel_experiencia
                    ) ORDER BY h.nome)
                    FROM habilidades_candidato hc
                    JOIN habilidades h ON h.id = hc.habilidade_id
                    WHERE hc.candidato_id = cand.id
                ), '[]'::jsonb) AS habilidades,
                COALESCE((
                    SELECT JSONB_AGG(ai2.nome ORDER BY ai2.nome)
                    FROM interesses_candidato ic
                    JOIN areas_interesse ai2 ON ai2.id = ic.interesse_id
                    WHERE ic.candidato_id = cand.id
                ), '[]'::jsonb) AS interesses,
                COALESCE((
                    SELECT JSONB_AGG(TO_JSONB(f) ORDER BY f.data_inicio DESC NULLS LAST)
                    FROM formacoes f
                    WHERE f.candidato_id = cand.id
                ), '[]'::jsonb) AS formacoes,
                COALESCE((
                    SELECT JSONB_AGG(TO_JSONB(e) ORDER BY e.data_inicio DESC NULLS LAST)
                    FROM experiencias e
                    WHERE e.candidato_id = cand.id
                ), '[]'::jsonb) AS experiencias
        FROM candidaturas c
        JOIN vagas v ON c.vaga_id = v.id
        JOIN candidatos cand ON c.candidato_id = cand.id
        JOIN usuarios u ON cand.usuario_id = u.id
        LEFT JOIN areas_interesse ai ON v.area_interesse_id = ai.id
        LEFT JOIN cultura_candidato cc ON cc.candidato_id = cand.id
        ORDER BY c.criado_em DESC;
        `
        const {rows} = await db.query(queryText);
        return rows;
    }
};

module.exports = CandidaturaModels;
