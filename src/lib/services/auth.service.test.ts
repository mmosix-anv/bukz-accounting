import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getMe } from './auth.service';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

const mockedDb = db as unknown as {
  select: Mock;
  insert: Mock;
  update: Mock;
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
});
