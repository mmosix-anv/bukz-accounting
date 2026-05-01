import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  users: { id: 'users.id' },
  profiles: { userId: 'profiles.userId' },
}));

import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
};

const mockDrizzle = { db: mockDb };

function makeChain(returnValue: unknown) {
  const chain: Record<string, unknown> = {};
  chain['from'] = vi.fn().mockReturnValue(chain);
  chain['where'] = vi.fn().mockReturnValue(chain);
  chain['leftJoin'] = vi.fn().mockReturnValue(chain);
  chain['limit'] = vi.fn().mockResolvedValue(returnValue);
  chain['values'] = vi.fn().mockResolvedValue(returnValue);
  chain['set'] = vi.fn().mockReturnValue(chain);
  chain['into'] = vi.fn().mockReturnValue(chain);
  return chain;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockEmail = { sendWelcome: vi.fn().mockResolvedValue(undefined) };
    service = new AuthService(mockDrizzle as never, mockEmail as never);
  });

  describe('getMe', () => {
    it('returns user with profile when found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'candidate',
        bio: null,
        location: 'London',
      };

      mockDb.select.mockReturnValue(makeChain([mockUser]));

      const result = await service.getMe('user-1');
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockDb.select.mockReturnValue(makeChain([]));

      await expect(service.getMe('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('syncUser', () => {
    it('inserts new user and profile when user does not exist', async () => {
      const selectChain = makeChain([]);
      const insertChain = makeChain([]);
      const getChain = makeChain([
        { id: 'new-user', email: 'new@test.com', name: 'New User', role: 'candidate' },
      ]);

      mockDb.select
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(getChain);
      mockDb.insert.mockReturnValue(insertChain);

      const supabaseUser = {
        id: 'new-user',
        email: 'new@test.com',
        user_metadata: { name: 'New User', role: 'candidate' },
      };

      await service.syncUser(supabaseUser);
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });

    it('skips insert when user already exists', async () => {
      const existingUser = { id: 'existing', email: 'existing@test.com', name: 'Existing', role: 'candidate' };
      const selectChain = makeChain([existingUser]);
      const getChain = makeChain([existingUser]);

      mockDb.select
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(getChain);

      await service.syncUser({
        id: 'existing',
        email: 'existing@test.com',
        user_metadata: {},
      });

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('defaults unknown role to candidate', async () => {
      const selectChain = makeChain([]);
      const insertChain = makeChain([]);
      const getChain = makeChain([
        { id: 'u', email: 'u@test.com', name: 'U', role: 'candidate' },
      ]);

      mockDb.select
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(getChain);
      mockDb.insert.mockReturnValue(insertChain);

      await service.syncUser({
        id: 'u',
        email: 'u@test.com',
        user_metadata: { role: 'hacker' },
      });

      const insertCall = (insertChain['values'] as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { role: string } | undefined;
      expect(insertCall?.role).toBe('candidate');
    });
  });

  describe('updateProfile', () => {
    it('calls update and returns refreshed user', async () => {
      const mockUser = { id: 'u1', email: 'u@test.com', name: 'U', role: 'candidate', bio: 'Updated bio' };
      const updateChain = makeChain([]);
      const getChain = makeChain([mockUser]);

      mockDb.update.mockReturnValue(updateChain);
      mockDb.select.mockReturnValue(getChain);

      const result = await service.updateProfile('u1', { bio: 'Updated bio' });
      expect(result).toEqual(mockUser);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
