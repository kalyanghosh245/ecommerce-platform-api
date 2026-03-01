"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashForSearch = exports.decrypt = exports.encrypt = void 0;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const getMasterKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
    return Buffer.from(key.padEnd(32).slice(0, 32));
};
const encrypt = (text) => {
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const salt = (0, crypto_1.randomBytes)(SALT_LENGTH);
    const key = (0, crypto_1.scryptSync)(getMasterKey(), salt, 32);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const result = Buffer.concat([salt, iv, authTag, encrypted]);
    return result.toString('base64');
};
exports.encrypt = encrypt;
const decrypt = (encryptedData) => {
    const data = Buffer.from(encryptedData, 'base64');
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const key = (0, crypto_1.scryptSync)(getMasterKey(), salt, 32);
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
};
exports.decrypt = decrypt;
const hashForSearch = (data) => {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', process.env.HMAC_SECRET || 'default-secret')
        .update(data.toLowerCase().trim())
        .digest('hex');
};
exports.hashForSearch = hashForSearch;
//# sourceMappingURL=encryption.utils.js.map