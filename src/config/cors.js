const env = require('./env');

const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        const error = new Error('Origem não permitida pela política CORS.');
        error.statusCode = 403;
        error.code = 'CORS_FORBIDDEN';
        return callback(error);
    },

    methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS'
    ],

    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Confirma-Senha'
    ],

    credentials: true,
    maxAge: 86400
};

module.exports = corsOptions;
