import { describe, it, expect } from 'vitest';
import sanitizeBody from '../middleware/sanitizeBody';

// Helper to create a minimal Express-like req object
function makeReq(body) {
  return { body };
}
const noopNext = () => {};

describe('sanitizeBody middleware', () => {
  it('strips HTML tags from string fields', () => {
    const req = makeReq({ name: '<script>alert(1)</script>', desc: '<b>Bold</b>' });
    sanitizeBody(req, {}, noopNext);
    expect(req.body.name).toBe('alert(1)');
    expect(req.body.desc).toBe('Bold');
  });

  it('preserves non-string fields unchanged', () => {
    const req = makeReq({ count: 42, price: 19.99, active: true, tags: ['a', 'b'] });
    sanitizeBody(req, {}, noopNext);
    expect(req.body.count).toBe(42);
    expect(req.body.price).toBe(19.99);
    expect(req.body.active).toBe(true);
    expect(req.body.tags).toEqual(['a', 'b']);
  });

  it('keeps nested objects as-is (top-level sanitization only)', () => {
    const req = makeReq({ user: { name: '<script>evil</script>', age: 30 } });
    sanitizeBody(req, {}, noopNext);
    // Only top-level strings are sanitized; nested objects passed through unchanged
    expect(req.body.user.name).toBe('<script>evil</script>');
    expect(req.body.user.age).toBe(30);
  });

  it('handles empty body gracefully', () => {
    const req = makeReq({});
    sanitizeBody(req, {}, noopNext);
    expect(req.body).toEqual({});
  });
});
