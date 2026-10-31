const crypto = require('node:crypto');
const env = require('../config/env');

const EXPIRATION_DAYS = 30;
const signature = (id, expiry) => crypto.createHmac('sha256', env.JWT_SECRET)
    .update(`vaga-compartilhada:v1:${id}:${expiry}`).digest('hex');

function createToken(id) {
    const expiry = Math.floor(Date.now() / 1000) + EXPIRATION_DAYS * 86400;
    return `${expiry}.${signature(id, expiry)}`;
}
function validToken(id, token) {
    if (!/^[1-9]\d{9,11}\.[a-f0-9]{64}$/.test(token || '') || !/^[1-9]\d*$/.test(String(id))) return false;
    const [expiryText, supplied] = token.split('.');
    const expiry = Number(expiryText);
    if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) return false;
    const expected = Buffer.from(signature(id, expiry), 'hex');
    const received = Buffer.from(supplied, 'hex');
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
module.exports = { createToken, validToken };
