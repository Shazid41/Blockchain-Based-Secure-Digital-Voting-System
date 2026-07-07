import { describe, expect, it } from 'vitest';
import { isStrongPassword, isValidEmail, isValidVoterNumber, maskEmail } from '../src/utils/validation.js';

describe('validation helpers', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('voter@example.com')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('voter-example')).toBe(false);
  });

  it('accepts 10 or 16 digit voter numbers only', () => {
    expect(isValidVoterNumber('1234567890')).toBe(true);
    expect(isValidVoterNumber('1234567890123456')).toBe(true);
    expect(isValidVoterNumber('123456789')).toBe(false);
    expect(isValidVoterNumber('12345678901')).toBe(false);
  });

  it('checks basic password strength', () => {
    expect(isStrongPassword('12345678')).toBe(true);
    expect(isStrongPassword('1234567')).toBe(false);
  });

  it('masks email addresses for verification screens', () => {
    expect(maskEmail('student@example.com')).toBe('st***@example.com');
  });
});
