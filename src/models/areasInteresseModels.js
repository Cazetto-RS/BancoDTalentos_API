const db = require('../config/database')

const AreasInteresseModels = {
    criar: async ({nome}) => {
        const queryText = `
        INSERT INTO areas_interesse (nome)
        VALUES ($1)
        RETURNING *
        `;
        const {rows} = await db.query(queryText, [nome]);
        return rows[0];
    },

    buscarTodos: async () => {
        const queryText = `
        SELECT * FROM areas_interesse
        ORDER BY nome ASC
        `;
        const {rows} = await db.query(queryText);
        return rows;
    },

    atualizar: async (id, {nome}) => {
        const queryText = `
        UPDATE areas_interesse
        SET
            nome = COALESCE($1, nome)
        WHERE id = $2 RETURNING *
        `;
        const {rows} = await db.query(queryText, [nome, id]);
        return rows[0];
    },

    deletar: async (id) => {
        const queryText = `
        DELETE FROM areas_interesse WHERE id = $1 RETURNING *
        `;
        const {rows} = await db.query(queryText, [id]);
        return rows[0];
    }
};

module.exports = AreasInteresseModels;