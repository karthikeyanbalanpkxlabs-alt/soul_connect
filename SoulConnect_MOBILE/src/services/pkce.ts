import {sha256} from 'js-sha256';

const VERIFIER_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function randomVerifier(length = 64): string {
  const bytes = new Uint8Array(length);
  const cryptoObj = (globalThis as {crypto?: {getRandomValues?: (bytes: Uint8Array) => Uint8Array}})
    .crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += VERIFIER_CHARS[bytes[i] % VERIFIER_CHARS.length];
  }
  return out;
}

function base64Url(bytes: number[]): string {
  const binary = bytes.map(byte => String.fromCharCode(byte)).join('');
  const encode = (globalThis as {btoa?: (value: string) => string}).btoa;
  if (!encode) {
    throw new Error('Base64 encoding is unavailable');
  }
  return encode(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createPkcePair(): {verifier: string; challenge: string} {
  const verifier = randomVerifier();
  return {verifier, challenge: base64Url(sha256.array(verifier))};
}

export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const part = token.split('.')[1];
    if (!part) {
      return null;
    }
    const padded = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const decode = (globalThis as {atob?: (value: string) => string}).atob;
    if (!decode) {
      return null;
    }
    return JSON.parse(decode(padded + pad));
  } catch {
    return null;
  }
}

export function tokenExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return false;
  }
  return Date.now() / 1000 > Number(payload.exp) - skewSeconds;
}

export function rolesFromToken(token: string): string[] {
  const roles = decodeJwt(token)?.realm_access?.roles;
  return Array.isArray(roles) ? roles.map(String) : [];
}

const APP_ROLES = ['manager_g', 'assit_g', 'assist_g', 'customer_g'];

export function primaryRole(roles: string[]): string {
  return roles.find(role => APP_ROLES.includes(role)) || 'no_roles';
}

export function isStaffRole(role: string): boolean {
  return role === 'manager_g' || role === 'assit_g' || role === 'assist_g';
}
