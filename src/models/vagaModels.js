const db = require('../config/database');

const vagasModels = {
    criarVaga: async ({ titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status }) => {
        const queryText = `
        INSERT INTO vagas (titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `;
        const values = [
            titulo,
            descricao || null,
            modelo_trabalho || null,
            tipo_contrato || null,
            salario_min || null,
            salario_max || null,
            status || 'ativo'
        ];
        const { rows } = await db.query(queryText, values);
        return rows[0];
    },

    buscarTodos: async () => {
        const queryText = `
        SELECT 
                v.*,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'habilidade_id', hv.habilidade_id,
                            'nome', h.nome,
                            'categoria', h.categoria,
                            'obrigatoria', hv.obrigatoria
                        )
                    ) FILTER (WHERE hv.habilidade_id IS NOT NULL), 
                    '[]'::json
                ) AS habilidades
        FROM vagas v
        LEFT JOIN habilidades_vaga hv ON v.id = hv.vaga_id
        LEFT JOIN habilidades h ON hv.habilidade_id = h.id
        GROUP BY v.id
        ORDER BY v.criado_em DESC
        `
        const { rows } = await db.query(queryText);
        return rows;
    },

    buscarPorId: async (id) => {
        const queryText = `
        SELECT * FROM vagas WHERE id = $1;
        `
        const { rows } = await db.query(queryText, [id]);
        return rows[0];
    },

    atualizarVaga: async (id, { titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status }) => {
        const queryText = `
        UPDATE vagas
        SET
            titulo = COALESCE ($2, titulo),
            descricao = COALESCE ($3, descricao),
            modelo_trabalho = COALESCE ($4, modelo_trabalho),
            tipo_contrato = COALESCE ($5, tipo_contrato),
            salario_min = COALESCE ($6, salario_min),
            salario_max = COALESCE ($7, salario_max),
            status = COALESCE ($8, status)  
        WHERE id = $1
        RETURNING *
        `;

        const values = [
            id, 
            titulo || null, 
            descricao || null, 
            modelo_trabalho || null, 
            tipo_contrato || null, 
            salario_min || null, 
            salario_max || null, 
            status || null
        ];

        const { rows } = await db.query(queryText, values);
        return rows[0];
    },

    excluirVaga: async (id) => {
        const queryText = `
        DELETE FROM vagas WHERE id = $1 RETURNING id
        `;
        const { rows } = await db.query(queryText, [id]);
        return rows[0];
    }
};

module.exports = vagasModels;