const db = require('../config/database');

const vagasModels = {
    criarVaga: async ({ titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status, area_interesse_id }, executor = db) => {
        const queryText = `
        INSERT INTO vagas (titulo, descricao, modelo_trabalho, tipo_contrato, salario_min, salario_max, status, area_interesse_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `;
        const values = [
            titulo,
            descricao ?? null,
            modelo_trabalho ?? null,
            tipo_contrato ?? null,
            salario_min ?? null,
            salario_max ?? null,
            status || 'ativo',
            area_interesse_id ?? null
        ];
        const { rows } = await executor.query(queryText, values);
        return rows[0];
    },

    buscarTodos: async ({ somenteAtivas = false, executor = db } = {}) => {
        const queryText = `
        SELECT 
                v.*,
                COALESCE(
                    JSONB_AGG(DISTINCT
                        JSONB_BUILD_OBJECT(
                            'habilidade_id', hv.habilidade_id,
                            'nome', h.nome,
                            'categoria', h.categoria,
                            'obrigatoria', hv.obrigatoria
                        )
                    ) FILTER (WHERE hv.habilidade_id IS NOT NULL), 
                    '[]'::jsonb
                ) AS habilidades
                , ai.nome AS area_nome
                , COUNT(DISTINCT c.id)::int AS candidatos
        FROM vagas v
        LEFT JOIN habilidades_vaga hv ON v.id = hv.vaga_id
        LEFT JOIN habilidades h ON hv.habilidade_id = h.id
        LEFT JOIN areas_interesse ai ON v.area_interesse_id = ai.id
        LEFT JOIN candidaturas c ON v.id = c.vaga_id
        ${somenteAtivas ? "WHERE v.status = 'ativo'" : ''}
        GROUP BY v.id, ai.nome
        ORDER BY v.criado_em DESC
        `
        const { rows } = await executor.query(queryText);
        return rows;
    },

    buscarPorId: async (id, { somenteAtiva = false } = {}) => {
        const queryText = `
        SELECT * FROM vagas WHERE id = $1 ${somenteAtiva ? "AND status = 'ativo'" : ''};
        `
        const { rows } = await db.query(queryText, [id]);
        return rows[0];
    },

    buscarAtivaPorId: async (id) => {
        const { rows } = await db.query("SELECT id FROM vagas WHERE id = $1 AND status = 'ativo'", [id]);
        return rows[0];
    },

    atualizarVaga: async (id, dados, executor = db) => {
        const permitidos = ['titulo', 'descricao', 'modelo_trabalho', 'tipo_contrato', 'salario_min', 'salario_max', 'status', 'area_interesse_id'];
        const campos = permitidos.filter((campo) => Object.hasOwn(dados, campo));
        if (campos.length === 0) {
            const { rows } = await executor.query('SELECT * FROM vagas WHERE id = $1', [id]);
            return rows[0];
        }
        const values = campos.map((campo) => dados[campo]);
        values.push(id);
        const sets = campos.map((campo, index) => `${campo} = $${index + 1}`).join(', ');
        const { rows } = await executor.query(`UPDATE vagas SET ${sets} WHERE id = $${values.length} RETURNING *`, values);
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
