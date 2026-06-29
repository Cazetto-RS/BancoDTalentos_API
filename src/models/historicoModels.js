const db = require('../config/database');

const HistoricoModels = {
    adicionarExperiencias: async (candidato_id, experiencias) => {
        const resultados = [];

        for (const exp of experiencias) {
            const queryText = `
            INSERT INTO experiencias (candidato_id, empresa, cargo, descricao, data_inicio, data_fim, atual)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, candidato_id, empresa, cargo, descricao, data_inicio, data_fim, atual
            `;

            const values = [
                candidato_id,
                exp.empresa,
                exp.cargo,
                exp.descricao || null,
                exp.data_inicio || null,
                exp.data_fim || null,
                exp.atual || false
            ];
            const { rows } = await db.query(queryText, values);
            resultados.push(rows[0]);
        }
        return resultados;
    },

    adicionarFormacoes: async (candidato_id, formacoes) => {
        const resultados = [];

        for (const form of formacoes) {
            const queryText = `
            INSERT INTO formacoes (candidato_id, curso, instituicao, semestre_atual, turno, status, data_inicio, data_fim, url_certificado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, candidato_id, curso, instituicao, semestre_atual, turno, status, data_inicio, data_fim, url_certificado
            `;

            const values = [
                candidato_id,
                form.curso,
                form.instituicao,
                form.semestre_atual || null,
                form.turno || null,
                form.status,
                form.data_inicio || null,
                form.data_fim || null,
                form.url_certificado || null
            ];
            const { rows } = await db.query(queryText, values);
            resultados.push(rows[0]);
        }
        return resultados;
    },

    buscarExperienciasPorCandidatoId: async (candidato_id) => {
        const { rows } = await db.query('SELECT * FROM experiencias WHERE candidato_id = $1 ORDER BY data_inicio DESC', [candidato_id]);
        return rows;
    },

    buscarFormacoesPorCandidatoId: async (candidato_id) => {
        const { rows } = await db.query('SELECT * FROM formacoes WHERE candidato_id = $1 ORDER BY data_inicio DESC', [candidato_id]);
        return rows;
    },

    editarExperiencias: async (id, candidato_id, {empresa, cargo, descricao, data_inicio, data_fim, atual}) => {
        const queryText = `
        UPDATE experiencias
        SET
            empresa = COALESCE($3, empresa),
            cargo = COALESCE($4, cargo),
            descricao = COALESCE($5, descricao),
            data_inicio = COALESCE($6, data_inicio),
            data_fim = COALESCE($7, data_fim),
            atual = COALESCE($8, atual)
        WHERE id = $1 AND candidato_id = $2
        RETURNING *
        `;
        const values = [id, candidato_id, empresa || null, cargo || null, descricao || null, data_inicio || null, data_fim || null, atual || null];
        const { rows } = await db.query(queryText, values);
        return rows[0];
    },

    editarFormacoes: async (id, candidato_id, {curso, instituicao, semestre_atual, turno, status, data_inicio, data_fim, url_certificado}) => {
        const queryText = `
        UPDATE formacoes
        SET
            curso = COALESCE($3, curso),
            instituicao = COALESCE($4, instituicao),
            semestre_atual = COALESCE($5, semestre_atual),
            turno = COALESCE($6, turno),
            status = COALESCE($7, status),
            data_inicio = COALESCE($8, data_inicio),
            data_fim = COALESCE($9, data_fim),
            url_certificado = COALESCE($10, url_certificado)
        WHERE id = $1 AND candidato_id = $2
        RETURNING *
        `;
        const values = [id, candidato_id, curso || null, instituicao || null, semestre_atual || null, turno || null, status || null, data_inicio || null, data_fim || null, url_certificado || null];
        const { rows } = await db.query(queryText, values);
        return rows[0];
    },

    deletarExperiencias: async (id, candidato_id) => {
        const queryText = 'DELETE FROM experiencias WHERE id = $1 AND candidato_id = $2 RETURNING id';
        const { rows } = await db.query(queryText, [id, candidato_id]);
        return rows[0];
    },

    deletarFormacoes: async (id, candidato_id) => {
        const queryText = 'DELETE FROM formacoes WHERE id = $1 AND candidato_id = $2 RETURNING id';
        const { rows } = await db.query(queryText, [id, candidato_id]);
        return rows[0];
    },
};

module.exports = HistoricoModels