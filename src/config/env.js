require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z
        .string()
        .min(1, 'DATABASE_URL não configurada'),

    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),

    JWT_EXPIRES_IN: z.string().min(2).default('1d'),

    SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),

    DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(5000).max(120000).default(60000),

    CORS_ORIGINS: z.string().trim().min(1, 'CORS_ORIGINS não configurada'),

    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
    SUPABASE_STORAGE_BUCKET: z.string().trim().min(1).default('banco-talentos'),
    SUPABASE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(86400).default(900),

    PORT: z.coerce.number().int().min(1).max(65535).default(3000)
}).superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'test' && (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)) {
        ctx.addIssue({
            code: 'custom',
            path: ['SUPABASE_URL'],
            message: 'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias fora dos testes.'
        });
    }
});

const parseEnv = envSchema.safeParse(process.env);

if (!parseEnv.success) {
    console.error (
        'Erro nas variáveis de ambiente:'
    );

    console.error (
        parseEnv.error.format()
    );

    process.exit(1);
}

module.exports = parseEnv.data;
