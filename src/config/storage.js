const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let client;

const getStorageClient = () => {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        const error = new Error('O armazenamento de arquivos não está configurado.');
        error.statusCode = 503;
        error.code = 'STORAGE_NOT_CONFIGURED';
        throw error;
    }

    if (!client) {
        client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    }

    return client.storage.from(env.SUPABASE_STORAGE_BUCKET);
};

module.exports = { getStorageClient };
