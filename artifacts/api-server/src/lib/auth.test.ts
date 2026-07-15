import { describe, it, expect, beforeEach } from 'vitest';
import { signToken, verifyToken, type JwtPayload } from './auth';

describe('auth – signToken / verifyToken', () => {
  const payload: JwtPayload = { userId: 1, username: 'imuzaki' };

  it('returns a non-empty string', () => {
    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('round-trips the payload', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.username).toBe(payload.username);
  });

  it('throws on a tampered token', () => {
    const token = signToken(payload);
    const tampered = token.slice(0, -4) + 'xxxx';
    expect(() => verifyToken(tampered)).toThrow();
  });

  it('throws on an expired token', async () => {
    // Sign with a 1ms expiry using the raw jwt module to avoid exposing secrets
    const jwt = await import('jsonwebtoken');
    const secret = process.env['SESSION_SECRET'] ?? 'imuzaki-donation-hub-secret';
    const shortLived = jwt.sign(payload, secret, { expiresIn: '1ms' });
    // Wait long enough for the token to be clearly expired
    await new Promise((r) => setTimeout(r, 50));
    expect(() => verifyToken(shortLived)).toThrow();
  });
});
