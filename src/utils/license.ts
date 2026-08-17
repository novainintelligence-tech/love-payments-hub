import crypto from 'crypto';

// Example generator: PREFIX-XXXX-XXXX-XXXX
export function generateLicenseKey(prefix = 'LP', segments = 3, segmentLen = 4) {
  const bytes = crypto.randomBytes(segments * 2);
  const hex = bytes.toString('hex').toUpperCase();
  const parts = [];
  for (let i = 0; i < segments; i++) {
    parts.push(hex.slice(i * segmentLen, i * segmentLen + segmentLen));
  }
  return `${prefix}-${parts.join('-')}`;
}
