import { describe, it, expect } from 'vitest';
import { BcryptPasswordHasher } from './bcrypt-hasher';

describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
  });

  it('should hash a password', async () => {
    const password = 'password123';
    const hash = await hasher.hash(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('should verify a correct password', async () => {
    const password = 'password123';
    const hash = await hasher.hash(password);

    const isValid = await hasher.verify(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'password123';
    const wrongPassword = 'wrongpassword';
    const hash = await hasher.hash(password);

    const isValid = await hasher.verify(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});
