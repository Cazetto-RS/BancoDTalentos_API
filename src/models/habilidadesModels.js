const db = require('../config/database');

const HabilidadesModels = {
    criar: async ({nome, categoria}) => {
        const queryText = `
        INSERT INTO habilidades (nome, categoria)
        VALUES (LOWER($1), $2)
        RETURNING *
        `;
        const {rows} = await db.query(queryText, [nome, categoria]);
        return rows[0];
    },

    buscarTodos: async () => {
        const queryText = `
        SELECT * FROM habilidades
        ORDER BY nome ASC
        `;
        const {rows} = await db.query(queryText);
        return rows;
    },

    atualizar: async (id, {nome, categoria}) => {
        const queryText = `
        UPDATE habilidades
        SET
            nome = COALESCE(LOWER($1), nome),
            categoria = COALESCE($2, categoria)
        WHERE id = $3 RETURNING *
        `;
        const {rows} = await db.query(queryText, [nome, categoria, id]);
        return rows[0];
    },

    deletar: async (id) => {
        const queryText = `
        DELETE FROM habilidades WHERE id = $1 RETURNING *
        `;
        const {rows} = await db.query(queryText, [id]);
        return rows[0];
    }
};

module.exports = HabilidadesModels;