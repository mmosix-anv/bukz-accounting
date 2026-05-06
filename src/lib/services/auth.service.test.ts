import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { syncUser, getMe } from './auth.service';
import { db } from '@/lib/db';
import { email } from '@/lib/email';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/email', () => ({
  email: {
    sendWelcome: vi.fn(),
  },
}));

const mockedDb = db as unknown as {
  select: Mock;
  insert: Mock;
  update: Mock;
};

const mockedEmail = email as unknown as {
  sendWelcome: Mock;
};

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMe', () => {
    it('throws error if user not found', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockLeftJoin = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      mockedDb.select = mockSelect;
      mockSelect.mockReturnValue({
        from: mockFrom.mockReturnValue({
          leftJoin: mockLeftJoin.mockReturnValue({
            where: mockWhere.mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      await expect(getMe('123')).rejects.toThrow('User not found');
    });

    it('returns user profile if found', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockLeftJoin = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([{ id: '123', name: 'Test User' }]);

      mockedDb.select = mockSelect;
      mockSelect.mockReturnValue({
        from: mockFrom.mockReturnValue({
          leftJoin: mockLeftJoin.mockReturnValue({
            where: mockWhere.mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      const user = await getMe('123');
      expect(user).toEqual({ id: '123', name: 'Test User' });
    });
  });

  describe('syncUser', () => {
    it('creates a new user and sends welcome email if user does not exist', async () => {
      const existingLimit = vi.fn().mockResolvedValue([]);
      const getMeLimit = vi.fn().mockResolvedValue([{ id: '123', name: 'Test User' }]);
      const mockSelect = vi.fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: existingLimit,
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: getMeLimit,
              }),
            }),
          }),
        });

      mockedDb.select = mockSelect;

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue({});
      mockedDb.insert = mockInsert;
      mockInsert.mockReturnValue({ values: mockValues });

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User', role: 'candidate' }
      };

      mockedEmail.sendWelcome.mockResolvedValue(undefined);

      await syncUser(mockUser);

      expect(db.insert).toHaveBeenCalledTimes(2);
      expect(email.sendWelcome).toHaveBeenCalledWith('test@example.com', 'Test User', 'candidate');
    });
  });
});
