// Validation rules
const rules = {
  required: (value, fieldName) =>
    !value || (typeof value === 'string' && !value.trim())
      ? `${fieldName || 'This field'} is required`
      : null,

  email: (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Invalid email address'
      : null,

  minLength: (min) => (value) =>
    value && value.length < min
      ? `Must be at least ${min} characters`
      : null,

  maxLength: (max) => (value) =>
    value && value.length > max
      ? `Must be at most ${max} characters`
      : null,

  isPositiveNumber: (value) =>
    value !== undefined && value !== null && (isNaN(value) || Number(value) <= 0)
      ? 'Must be a positive number'
      : null,

  hasLowerCase: (value) =>
    value && !/[a-z]/.test(value)
      ? 'Must contain at least one lowercase letter'
      : null,

  hasUpperCase: (value) =>
    value && !/[A-Z]/.test(value)
      ? 'Must contain at least one uppercase letter'
      : null,

  hasDigit: (value) =>
    value && !/[0-9]/.test(value)
      ? 'Must contain at least one digit'
      : null,

  hasLetter: (value) =>
    value && !/[a-zA-Z]/.test(value)
      ? 'Must contain at least one letter'
      : null,
};

/**
 * Validate form fields against a rules object.
 * @param {Object} fields - { fieldName: value, ... }
 * @param {Object} ruleMap - { fieldName: ['required', 'email', ...] or ['required', ['minLength', 6]] }
 * @returns {{ valid: boolean, errors: Object<string, string> }}
 */
export function validateForm(fields, ruleMap) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(ruleMap)) {
    const value = fields[field];

    for (const rule of fieldRules) {
      let errorMessage;

      if (Array.isArray(rule)) {
        // rule is [ruleName, ...args]
        const [ruleName, ...args] = rule;
        const ruleFn = rules[ruleName];
        if (ruleFn) {
          errorMessage = typeof ruleFn === 'function' ? ruleFn(...args)(value) : null;
        }
      } else if (typeof rule === 'string') {
        const ruleFn = rules[rule];
        if (ruleFn) {
          errorMessage = ruleFn(value, field);
        }
      }

      if (errorMessage) {
        errors[field] = errorMessage;
        break; // first error wins per field
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export default { validateForm };
