const db = require('../config/database')

const UsuarioModel = {
    buscarPorEmail: async (email) => {
        const queryText = 'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)';
        const { rows } = await db.query(queryText, [email]);
        return rows[0];
    },

    criarCandidato: async ({ nome_completo, email, senha_hash }) => {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // Certifique-se de que NÃO há pontos finais nos finais das linhas de comando SQL
            const queryUsuario = `
                INSERT INTO usuarios (nome_completo, email, senha_hash, cargo)
                VALUES ($1, $2, $3, 'candidato')
                RETURNING id, nome_completo, email, cargo, criado_em
            `; // Removi qualquer ponto ou ponto-e-vírgula extra aqui

            const resUsuario = await client.query(queryUsuario, [nome_completo, email, senha_hash]);
            const novoUsuario = resUsuario.rows[0];

            const queryCandidato = `
                INSERT INTO candidatos (usuario_id)
                VALUES ($1)
                RETURNING id AS candidato_id
            `;

            const resCandidato = await client.query(queryCandidato, [novoUsuario.id]);
            const novoCandidato = resCandidato.rows[0];

            await client.query('COMMIT');

            return {
                ...novoUsuario,
                candidato_id: novoCandidato.candidato_id
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    buscarPorId: async (id) => {
        const queryText = `
        SELECT id, nome_completo, email, cargo, criado_em
        FROM usuarios
        WHERE id = $1
        `
        const { rows } = await db.query(queryText, [id]);
        return rows[0];
    },

    buscarPorNome: async (nome) => {
        const queryText = `
        SELECT id, nome_completo, email, cargo, criado_em
        FROM usuarios
        WHERE nome_completo ILIKE $1
        `
        const { rows } = await db.query(queryText, [`%${nome}%`]);
        return rows;
    },

    buscarTodos: async () => {
        const queryText = `
        SELECT id, nome_completo, email, cargo, criado_em
        FROM usuarios
        ORDER BY id DESC;
        `
        const { rows } = await db.query(queryText);
        return rows;
    },

    atualizarInformacoes: async (id, dados) => {
        const permitidos = ['nome_completo', 'email', 'senha_hash'];
        const campos = permitidos.filter((campo) => dados[campo] !== undefined && dados[campo] !== null);
        if (campos.length === 0) return UsuarioModel.buscarPorId(id);
        const values = campos.map((campo) => dados[campo]);
        values.push(id);
        const sets = campos.map((campo, index) => `${campo} = $${index + 1}`).join(', ');
        const { rows } = await db.query(`UPDATE usuarios SET ${sets} WHERE id = $${values.length} RETURNING id, nome_completo, email, cargo, criado_em`, values);
        return rows[0];
    },
    deletarUsuario: async (id) => {
        const queryText = `
        DELETE FROM usuarios
        WHERE id = $1
        RETURNING id;
        `
        const { rows } = await db.query(queryText, [id]);
        return rows[0];
    },
    // Função para pegar somente a senha, foi criada para o deletarUsuario Controller afim de preserver a segurança
    buscarSenhaHash: async (id) => {
        const queryText = `
        SELECT senha_hash FROM usuarios WHERE id = $1;
        `
        const { rows } = await db.query(queryText, [id]);
        return rows[0]
    },



    // Área de sessoes
    criarSessao: async (usuario_id, token) => {

            await db.query("DELETE FROM sessoes WHERE criado_em < NOW() - ($1 * INTERVAL '1 day');", [require('../config/env').SESSION_TTL_DAYS])
        await db.query("DELETE FROM sessoes WHERE usuario_id = $1;", [usuario_id])

        const queryText = `
        INSERT INTO sessoes (usuario_id, token)
        VALUES ($1, $2)
        RETURNING id, criado_em
        `;
        const { rows } = await db.query(queryText, [usuario_id, token]);
        return rows[0];
    },

    criarUsuarioPorAdmin: async ({ nome_completo, email, senha_hash, cargo }) => {
        const queryText = `
        INSERT INTO usuarios (nome_completo, email, senha_hash, cargo)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome_completo, email, cargo, criado_em
        `;
        const values = [nome_completo, email, senha_hash, cargo];
        const { rows } = await db.query(queryText, values);
        return rows[0];
    },

    encerrarSessao: async (usuario_id, token) => {
        const { rows } = await db.query(
            'DELETE FROM sessoes WHERE usuario_id = $1 AND token = $2 RETURNING id',
            [usuario_id, token]
        );
        return rows[0];
    }
};

module.exports = UsuarioModel
