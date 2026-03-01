import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

// In production, use AWS KMS, Azure Key Vault, or HashiCorp Vault
const getMasterKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
  return Buffer.from(key.padEnd(32).slice(0, 32));
};

export const encrypt = (text: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(getMasterKey(), salt, 32);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // salt + iv + authTag + encrypted
  const result = Buffer.concat([salt, iv, authTag, encrypted]);
  return result.toString('base64');
};

export const decrypt = (encryptedData: string): string => {
  const data = Buffer.from(encryptedData, 'base64');
  
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  
  const key = scryptSync(getMasterKey(), salt, 32);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  return decipher.update(encrypted) + decipher.final('utf8');
};

// For search functionality - one-way hash
export const hashForSearch = (data: string): string => {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', process.env.HMAC_SECRET || 'default-secret')
    .update(data.toLowerCase().trim())
    .digest('hex');
};