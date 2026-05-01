import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  notifications: { userId: 'notifications.userId', id: 'notifications.id' },
}));

import { NotificationsService } from './notifications.service';

function makeChain(returnValue: unknown) {
  const chain: Record<string, unknown> = {};
  chain['from'] = vi.fn().mockReturnValue(chain);
  chain['where'] = vi.fn().mockReturnValue(chain);
  chain['orderBy'] = vi.fn().mockReturnValue(chain);
  chain['limit'] = vi.fn().mockResolvedValue(returnValue);
  chain['set'] = vi.fn().mockReturnValue(chain);
  chain['values'] = vi.fn().mockReturnValue(chain);
  chain['returning'] = vi.fn().mockResolvedValue(returnValue);
  return chain;
}

const mockDb = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
};

const mockDrizzle = { db: mockDb };

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NotificationsService(mockDrizzle as never);
  });

  describe('findByUser', () => {
    it('returns notifications for user ordered by createdAt desc', async () => {
      const mockNotifications = [
        { id: 'n1', title: 'New application', read: false, createdAt: new Date() },
        { id: 'n2', title: 'Job viewed', read: true, createdAt: new Date() },
      ];

      mockDb.select.mockReturnValue(makeChain(mockNotifications));

      const result = await service.findByUser('user-1');
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('n1');
    });

    it('defaults limit to 10', async () => {
      const chain = makeChain([]);
      mockDb.select.mockReturnValue(chain);

      await service.findByUser('user-1');
      expect(chain['limit']).toHaveBeenCalledWith(10);
    });

    it('accepts custom limit', async () => {
      const chain = makeChain([]);
      mockDb.select.mockReturnValue(chain);

      await service.findByUser('user-1', 25);
      expect(chain['limit']).toHaveBeenCalledWith(25);
    });
  });

  describe('markRead', () => {
    it('marks single notification as read and returns it', async () => {
      const updatedNotification = { id: 'n1', read: true };
      mockDb.update.mockReturnValue(makeChain([updatedNotification]));

      const result = await service.markRead('n1');
      expect(result).toEqual(updatedNotification);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('markAllRead', () => {
    it('calls update for all user notifications', async () => {
      mockDb.update.mockReturnValue(makeChain([]));

      await service.markAllRead('user-1');
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('inserts notification and returns it', async () => {
      const newNotification = { id: 'n3', title: 'Test', body: 'Body', userId: 'u1', type: 'info', read: false };
      mockDb.insert.mockReturnValue(makeChain([newNotification]));

      const result = await service.create({
        userId: 'u1',
        type: 'info',
        title: 'Test',
        body: 'Body',
      });

      expect(result).toEqual(newNotification);
    });
  });
});
