const { randomUUID } = require('node:crypto');
const env = require('../config/env');
const { getStorageClient } = require('../config/storage');
const { sucesso, erro400, erro403, erro404, erro500 } = require('../utils/apiResponse');

const TIPOS = {
    foto: {
        max: 3 * 1024 * 1024,
        mime: new Set(['image/jpeg', 'image/png', 'image/webp'])
    },
    curriculo: {
        max: 5 * 1024 * 1024,
        mime: new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
    },
    recomendacao: {
        max: 5 * 1024 * 1024,
        mime: new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
    },
    certificado: {
        max: 5 * 1024 * 1024,
        mime: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
    }
};

const EXTENSOES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
};

const normalizarCaminho = (value) => String(value || '').replace(/^storage:/, '').trim();
const pertenceAoUsuario = (path, userId) => path.startsWith(`usuarios/${userId}/`);

const assinar = async (path) => {
    const { data, error } = await getStorageClient().createSignedUrl(path, env.SUPABASE_SIGNED_URL_TTL_SECONDS);
    if (error) throw error;
    return data.signedUrl;
};

const UploadControllers = {
    enviar: async (req, res) => {
        let uploadedPath;
        try {
            const config = TIPOS[req.params.tipo];
            if (!config) return erro400(res, 'Tipo de upload inválido.');
            if (!req.file) return erro400(res, 'Envie o arquivo no campo "arquivo".');
            if (!config.mime.has(req.file.mimetype)) return erro400(res, `Formato inválido para ${req.params.tipo}.`);
            if (req.file.size > config.max) return erro400(res, `O arquivo excede o limite de ${config.max / 1024 / 1024} MB.`);

            const extension = EXTENSOES[req.file.mimetype];
            uploadedPath = `usuarios/${req.usuario.id}/${req.params.tipo}/${randomUUID()}.${extension}`;
            const storage = getStorageClient();
            const { error } = await storage.upload(uploadedPath, req.file.buffer, {
                contentType: req.file.mimetype,
                cacheControl: '3600',
                upsert: false
            });
            if (error) throw error;

            const previousPath = normalizarCaminho(req.body.arquivo_anterior);
            if (previousPath && pertenceAoUsuario(previousPath, req.usuario.id) && previousPath !== uploadedPath) {
                const { error: removalError } = await storage.remove([previousPath]);
                if (removalError) console.error('Falha ao remover arquivo substituído:', removalError.message);
            }

            const signedUrl = await assinar(uploadedPath);
            return sucesso(res, 201, 'Arquivo enviado com sucesso.', {
                caminho: `storage:${uploadedPath}`,
                url_temporaria: signedUrl,
                expira_em_segundos: env.SUPABASE_SIGNED_URL_TTL_SECONDS,
                nome_original: req.file.originalname,
                tamanho: req.file.size,
                tipo: req.params.tipo
            });
        } catch (error) {
            if (uploadedPath) {
                try { await getStorageClient().remove([uploadedPath]); } catch { /* limpeza de melhor esforço */ }
            }
            console.error('Erro ao enviar arquivo:', error);
            return erro500(res, 'Não foi possível enviar o arquivo.');
        }
    },

    gerarUrl: async (req, res) => {
        try {
            const path = normalizarCaminho(req.query.caminho);
            if (!path || path.includes('..')) return erro400(res, 'Caminho de arquivo inválido.');
            const employee = req.usuario.cargo === 'admin' || req.usuario.cargo === 'rh';
            if (!employee && !pertenceAoUsuario(path, req.usuario.id)) return erro403(res, 'Você não pode acessar este arquivo.');

            const url = await assinar(path);
            return sucesso(res, 200, 'Acesso temporário gerado.', {
                url,
                expira_em_segundos: env.SUPABASE_SIGNED_URL_TTL_SECONDS
            });
        } catch (error) {
            if (error?.statusCode === 404 || error?.status === 404) return erro404(res, 'Arquivo não encontrado.');
            console.error('Erro ao gerar acesso ao arquivo:', error);
            return erro500(res, 'Não foi possível acessar o arquivo.');
        }
    },

    remover: async (req, res) => {
        try {
            const path = normalizarCaminho(req.body.caminho);
            if (!path || path.includes('..')) return erro400(res, 'Caminho de arquivo inválido.');
            if (!pertenceAoUsuario(path, req.usuario.id)) return erro403(res, 'Você não pode excluir este arquivo.');

            const { error } = await getStorageClient().remove([path]);
            if (error) throw error;
            return sucesso(res, 200, 'Arquivo removido com sucesso.');
        } catch (error) {
            console.error('Erro ao remover arquivo:', error);
            return erro500(res, 'Não foi possível remover o arquivo.');
        }
    }
};

module.exports = UploadControllers;
