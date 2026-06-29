const db = require('../config/database')

const CandidatoModel = {
    buscarPorUsuarioId: async (usuario_id) => {
        const queryText = `
        SELECT id, usuario_id, telefone, cep, numero_rua, cidade, estado, url_foto, data_nascimento
        FROM candidatos
        WHERE usuario_id = $1
        `;
        const { rows } = await db.query(queryText, [usuario_id]);
        return rows[0];
    },

    salvarOuAtualizarCandidato: async (usuario_id, {telefone, cep, numero_rua, cidade, estado, url_foto, data_nascimento}) => {
        const queryText = `
        INSERT INTO candidatos (usuario_id, telefone, cep, numero_rua, cidade, estado, url_foto, data_nascimento)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (usuario_id)
        DO UPDATE SET
            telefone = COALESCE($2, candidatos.telefone),
            cep = COALESCE($3, candidatos.cep),
            numero_rua = COALESCE($4, candidatos.numero_rua),
            cidade = COALESCE($5, candidatos.cidade),
            estado = COALESCE($6, candidatos.estado),
            url_foto = COALESCE($7, candidatos.url_foto),
            data_nascimento = COALESCE($8, candidatos.data_nascimento)
        RETURNING id, usuario_id, telefone, cep, numero_rua, cidade, estado, url_foto, data_nascimento;
        `
        const values = [usuario_id, telefone || null, cep || null, numero_rua || null, cidade || null, estado || null, url_foto || null, data_nascimento || null]
        const { rows } = await db.query(queryText, values);
        return rows[0];
    },

    salvarOuAtualizarCultura: async (candidato_id, {motivacao, descricao_valores, apresentacao, arquivo_recomendacao}) => {
        const queryText = `
        INSERT INTO cultura_candidato (candidato_id, motivacao, descricao_valores, apresentacao, arquivo_recomendacao)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (candidato_id)
        DO UPDATE SET
            motivacao = COALESCE($2, cultura_candidato.motivacao),
            descricao_valores = COALESCE($3, cultura_candidato.descricao_valores),
            apresentacao = COALESCE($4, cultura_candidato.apresentacao),
            arquivo_recomendacao = COALESCE($5, cultura_candidato.arquivo_recomendacao)
        RETURNING id, candidato_id, motivacao, descricao_valores, apresentacao, arquivo_recomendacao;
        `
        const values = [candidato_id, motivacao || null, descricao_valores || null, apresentacao || null, arquivo_recomendacao || null];
        const { rows } = await db.query(queryText, values);
        return rows[0];
    },

    buscarCulturaCandidatos: async (candidato_id) => {
        const queryText = `
        SELECT * FROM cultura_candidato
        WHERE candidato_id = $1;
        `
        const { rows } = await db.query(queryText, [candidato_id]);
        return rows[0];
    }
}

module.exports = CandidatoModel