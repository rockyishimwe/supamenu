import { describe, it, expect } from 'vitest';
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

  it('returns error for maxLength exceeded', () => {
    const { valid, errors } = validateForm(
      { bio: 'a'.repeat(300) },
      { bio: [['maxLength', 200]] }
    );
    expect(valid).toBe(false);
    expect(errors.bio).toContain('200');
  });

  it('passes validation when within maxLength', () => {
    const { valid, errors } = validateForm(
      { bio: 'short bio' },
      { bio: [['maxLength', 200]] }
    );
    expect(valid).toBe(true);
  });

  describe('edge cases', () => {
    it('handles empty rules object', () => {
      const { valid, errors } = validateForm({ name: 'test' }, {});
      expect(valid).toBe(true);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('handles null value gracefully', () => {
      const { valid, errors } = validateForm(
        { name: null },
        { name: ['required'] }
      );
      expect(valid).toBe(false);
      expect(errors.name).toBe('name is required');
    });

    it('handles undefined value gracefully', () => {
      const { valid, errors } = validateForm(
        { name: undefined },
        { name: ['required'] }
      );
      expect(valid).toBe(false);
      expect(errors.name).toBe('name is required');
    });

    it('validates multiple fields simultaneously', () => {
      const { valid, errors } = validateForm(
        { name: '', email: 'bad', password: '' },
        {
          name: ['required'],
          email: ['required', 'email'],
          password: ['required', ['minLength', 6]],
        }
      );
      expect(valid).toBe(false);
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });

    it('rejects zero for isPositiveNumber', () => {
      const { valid, errors } = validateForm(
        { amount: 0 },
        { amount: ['isPositiveNumber'] }
      );
      expect(valid).toBe(false);
      expect(errors.amount).toBeDefined();
    });

    it('rejects whitespace-only string as empty for required', () => {
      const { valid, errors } = validateForm(
        { name: '   ' },
        { name: ['required'] }
      );
      expect(valid).toBe(false);
      expect(errors.name).toBe('name is required');
    });
  });
});
