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

    SMTP_HOST: z.string().trim().min(1).default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
    SMTP_SECURE: z.string().trim().default('true').transform((value) => value === 'true'),
    SMTP_USER: z.email().trim().toLowerCase().optional(),
    SMTP_PASSWORD: z.string().transform((value) => value.replace(/\s/g, '')).pipe(z.string().length(16)).optional(),
    EMAIL_FROM: z.string().trim().min(3).optional(),
    EMAIL_CODE_SECRET: z.string().min(32).optional(),
    EMAIL_CODE_TTL_MINUTES: z.coerce.number().int().min(5).max(30).default(10),
    EMAIL_CODE_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),
    EMAIL_CODE_RESEND_SECONDS: z.coerce.number().int().min(30).max(300).default(60),

    PORT: z.coerce.number().int().min(1).max(65535).default(3000)
}).superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'test' && (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)) {
        ctx.addIssue({
            code: 'custom',
            path: ['SUPABASE_URL'],
            message: 'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias fora dos testes.'
        });
    }
    if (env.NODE_ENV !== 'test' && (!env.SMTP_USER || !env.SMTP_PASSWORD || !env.EMAIL_FROM || !env.EMAIL_CODE_SECRET)) {
        ctx.addIssue({
            code: 'custom',
            path: ['SMTP_USER'],
            message: 'SMTP_USER, SMTP_PASSWORD, EMAIL_FROM e EMAIL_CODE_SECRET são obrigatórias fora dos testes.'
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
