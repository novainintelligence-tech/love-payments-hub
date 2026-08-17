import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const KEY_HEX = process.env.ENCRYPTION_KEY_HEX;
if (!KEY_HEX || KEY_HEX.length !== 64) {
  throw new Error('ENCRYPTION_KEY_HEX must be set to 32 bytes hex (64 chars)');
}
const KEY = Buffer.from(KEY_HEX, 'hex');

export function encryptToBuffer(plaintext: Buffer | string): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store as: iv (12) + tag (16) + ciphertext
  return Buffer.concat([iv, tag, ciphertext]);
}

export function decryptFromBuffer(payload: Buffer): Buffer {
  const iv = payload.slice(0, 12);
  const tag = payload.slice(12, 28);
  const ciphertext = payload.slice(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptToBase64(plain: string): string {
  return encryptToBuffer(Buffer.from(plain, 'utf8')).toString('base64');
}

export function decryptFromBase64(b64: string): string {
  const buff = Buffer.from(b64, 'base64');
  return decryptFromBuffer(buff).toString('utf8');
}
