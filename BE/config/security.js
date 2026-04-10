import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY_SIZE = 32; // 256 bits
const IV_SIZE = 16; // 128 bits

/**
 * Encrypt file buffer
 */
export function encryptFile(fileBuffer) {
  try {
    // Generate random encryption key and IV
    const key = crypto.randomBytes(ENCRYPTION_KEY_SIZE);
    const iv = crypto.randomBytes(IV_SIZE);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(fileBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Return encrypted data and key in base64
    const result = {
      encrypted: Buffer.concat([iv, encrypted]), // Prepend IV to encrypted data
      key: key.toString('base64')
    };

    return result;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt file buffer
 */
export function decryptFile(encryptedBuffer, keyString) {
  try {
    // Extract key from base64
    const key = Buffer.from(keyString, 'base64');

    // Extract IV from beginning of encrypted data
    const iv = encryptedBuffer.slice(0, IV_SIZE);
    const encrypted = encryptedBuffer.slice(IV_SIZE);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Decrypt
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Hash password
 */
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
}

/**
 * Check password strength
 */
export function isStrongPassword(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*\-_=+\[\]{}|;:,.<>?]/.test(password)
  };

  return Object.values(requirements).every(req => req);
}

/**
 * Get password strength message
 */
export function getPasswordStrengthMessage(password) {
  const issues = [];

  if (password.length < 8) issues.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) issues.push('an uppercase letter');
  if (!/[a-z]/.test(password)) issues.push('a lowercase letter');
  if (!/[0-9]/.test(password)) issues.push('a number');
  if (!/[!@#$%^&*\-_=+\[\]{}|;:,.<>?]/.test(password)) issues.push('a special character');

  if (issues.length === 0) return 'Strong password!';
  return `Password must contain: ${issues.join(', ')}`;
}

/**
 * Generate random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}
