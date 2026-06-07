import { describe, it, expect, vi } from 'vitest';
import { validateForm } from '../lib/validation';

describe('validateForm', () => {
  it('returns valid for correct fields', () => {
    const { valid, errors } = validateForm(
      { name: 'John', email: 'john@test.com' },
      { name: ['required'], email: ['required', 'email'] }
    );
    expect(valid).toBe(true);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('returns error for empty required field', () => {
    const { valid, errors } = validateForm(
      { name: '' },
      { name: ['required'] }
    );
    expect(valid).toBe(false);
    expect(errors.name).toBeDefined();
  });

  it('returns error for invalid email', () => {
    const { valid, errors } = validateForm(
      { email: 'not-an-email' },
      { email: ['email'] }
    );
    expect(valid).toBe(false);
    expect(errors.email).toBe('Invalid email address');
  });

  it('returns error for short password', () => {
    const { valid, errors } = validateForm(
      { password: 'ab' },
      { password: [['minLength', 6]] }
    );
    expect(valid).toBe(false);
    expect(errors.password).toContain('6');
  });

  it('returns error for non-positive number', () => {
    const { valid, errors } = validateForm(
      { amount: -5 },
      { amount: ['isPositiveNumber'] }
    );
    expect(valid).toBe(false);
    expect(errors.amount).toBeDefined();
  });

  it('returns first error only per field', () => {
    const { valid, errors } = validateForm(
      { email: '' },
      { email: ['required', 'email'] }
    );
    expect(valid).toBe(false);
    expect(errors.email).toBe('email is required');
  });
});
