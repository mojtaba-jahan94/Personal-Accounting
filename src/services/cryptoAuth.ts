// Cryptographic utilities using Web Crypto API (SubtleCrypto)
// Secure password hashing with PBKDF2-SHA256, per-user unique salt, and session token generation

/**
 * Generate a cryptographically random salt as hex string
 */
export function generateSalt(bytes = 16): string {
  const array = new Uint8Array(bytes);
  window.crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password using PBKDF2 with SHA-256, 100,000 iterations, and 256-bit output
 */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  
  // Convert hex salt back to bytes
  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );

  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    256
  );

  const derivedArray = new Uint8Array(derivedBits);
  return Array.from(derivedArray, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Constant-time comparison between two hex strings to mitigate timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify a plain text password against a stored PBKDF2 hash with its salt
 */
export async function verifyPassword(
  password: string,
  saltHex: string,
  storedHashHex: string
): Promise<boolean> {
  const computedHash = await hashPassword(password, saltHex);
  return constantTimeCompare(computedHash, storedHashHex);
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}
