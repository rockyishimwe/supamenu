import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger to avoid console noise
vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should hash passwords during registration', async () => {
    vi.mock('../models/User', () => ({
      default: {
        findOne: vi.fn().mockResolvedValue(null),
      },
    }));
    vi.mock('../models/Restaurant', () => ({
      default: {},
    }));
    vi.mock('bcryptjs', () => ({
      genSalt: vi.fn().mockResolvedValue('salt'),
      hash: vi.fn().mockResolvedValue('hashed_pw'),
    }));
    vi.mock('jsonwebtoken', () => ({
      sign: vi.fn().mockReturnValue('mock_token'),
    }));

    const authService = await import('../services/authService');
    const bcrypt = await import('bcryptjs');
    const User = await import('../models/User');

    await expect(
      authService.registerUser({
        name: 'Test',
        email: 'test@test.com',
        password: 'password123',
        role: 'customer',
      })
    ).rejects.toThrow('User already exists');

    expect(bcrypt.genSalt).toHaveBeenCalled();
  });

  it('should reject login with wrong password', async () => {
    vi.mock('../models/User', () => ({
      default: {
        findOne: vi.fn().mockResolvedValue({
          _id: '123',
          name: 'Test',
          email: 'test@test.com',
          role: 'customer',
          password: 'hashed',
        }),
      },
    }));
    vi.mock('bcryptjs', () => ({
      compare: vi.fn().mockResolvedValue(false),
    }));
    vi.mock('jsonwebtoken', () => ({
      sign: vi.fn(),
    }));

    const authService = await import('../services/authService');

    await expect(
      authService.loginUser({ email: 'test@test.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should return token on successful login', async () => {
    vi.mock('../models/User', () => ({
      default: {
        findOne: vi.fn().mockResolvedValue({
          _id: '123',
          name: 'Test',
          email: 'test@test.com',
          role: 'customer',
          password: 'hashed',
          walletBalance: 128.50,
          avatar: '',
          customerDetails: {},
          staffDetails: {},
          ownerDetails: {},
          toObject: () => ({}),
        }),
      },
    }));
    vi.mock('bcryptjs', () => ({
      compare: vi.fn().mockResolvedValue(true),
    }));
    vi.mock('jsonwebtoken', () => ({
      sign: vi.fn().mockReturnValue('token123'),
    }));

    vi.doMock('../middleware/auth', () => ({
      JWT_SECRET: 'test_secret',
    }));

    const authService = await import('../services/authService');

    const result = await authService.loginUser({ email: 'test@test.com', password: 'correct' });
    expect(result.token).toBe('token123');
    expect(result.user.email).toBe('test@test.com');
  });
});
