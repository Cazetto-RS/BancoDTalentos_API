const db = require('../config/database');

const NotificacaoModel = {
    criarParaUsuario: async (usuario_id, tipo, titulo, mensagem, dados = {}, executor = db) => {
        const { rows } = await executor.query(`
            INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, dados)
            VALUES ($1, $2, $3, $4, $5::jsonb)
            RETURNING *`, [usuario_id, tipo, titulo, mensagem, JSON.stringify(dados)]);
        return rows[0];
    },
    criarParaFuncionarios: async (tipo, titulo, mensagem, dados = {}, executor = db) => {
        const { rows } = await executor.query(`
            INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, dados)
            SELECT id, $1, $2, $3, $4::jsonb FROM usuarios WHERE cargo IN ('admin', 'rh')
            RETURNING *`, [tipo, titulo, mensagem, JSON.stringify(dados)]);
        return rows;
    },
    listar: async (usuario_id) => {
        const { rows } = await db.query(`SELECT * FROM notificacoes WHERE usuario_id = $1 ORDER BY criado_em DESC LIMIT 100`, [usuario_id]);
        return rows;
    },
    marcarLida: async (id, usuario_id) => {
        const { rows } = await db.query(`UPDATE notificacoes SET lida = true WHERE id = $1 AND usuario_id = $2 RETURNING *`, [id, usuario_id]);
        return rows[0];
    },
    marcarTodasLidas: async (usuario_id) => {
        const { rowCount } = await db.query(`UPDATE notificacoes SET lida = true WHERE usuario_id = $1 AND lida = false`, [usuario_id]);
        return rowCount;
    },
    garantirResumoSemanal: async (usuario_id) => {
        const semana = new Date().toISOString().slice(0, 10);
        const { rows: existente } = await db.query(`SELECT id FROM notificacoes WHERE usuario_id=$1 AND tipo='resumo_semanal' AND criado_em >= date_trunc('week', now()) LIMIT 1`, [usuario_id]);
        if (existente.length) return;
        const { rows } = await db.query(`SELECT
            (SELECT COUNT(*)::int FROM vagas WHERE criado_em >= date_trunc('week', now())) AS vagas,
            (SELECT COUNT(*)::int FROM candidaturas WHERE criado_em >= date_trunc('week', now())) AS candidaturas`);
        const resumo = rows[0];
        await NotificacaoModel.criarParaUsuario(usuario_id, 'resumo_semanal', 'Resumo da semana', `${resumo.vagas} vaga(s) e ${resumo.candidaturas} candidatura(s) cadastradas nesta semana.`, { semana });
    }
};

module.exports = NotificacaoModel;
