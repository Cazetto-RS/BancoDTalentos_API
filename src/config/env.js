const { z } = require('zod');

const envSchema = z.object({
    DATABASE_URL: z
        .string()
        .min(1, 'DATABASE_URL não configurada'),

    JWT_SECRET: z
        .string()
        .min(10, 'JWT_SECRET inválido '),

    PORT: z
        .string()
        .optional()
        .default('3000')
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