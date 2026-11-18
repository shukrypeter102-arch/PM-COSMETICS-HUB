import type { SignOptions } from 'jsonwebtoken';

/**
 * Returns the JWT signing secret. Refuses to fall back to a hard-coded value,
 * because a guessable default would let anyone forge login tokens.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
