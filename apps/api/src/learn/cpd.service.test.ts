import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  cpdLog: { userId: 'user_id', id: 'id', hours: 'hours', loggedAt: 'logged_at', courseId: 'course_id', activityDescription: 'activity_description' },
  courses: { id: 'id', title: 'title', slug: 'slug' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  desc: vi.fn((col) => ({ col, dir: 'desc' })),
  sql: vi.fn((s) => s),
}));

import { CpdService } from './cpd.service';

function makeChain(returnValue: unknown) {
  const c: Record<string, unknown> = {};
  c['from'] = vi.fn().mockReturnValue(c);
  c['where'] = vi.fn().mockReturnValue(c);
  c['orderBy'] = vi.fn().mockReturnValue(c);
  c['leftJoin'] = vi.fn().mockReturnValue(c);
  c['select'] = vi.fn().mockReturnValue(c);
  c['values'] = vi.fn().mockReturnValue(c);
  c['limit'] = vi.fn().mockResolvedValue(returnValue);
  c['returning'] = vi.fn().mockResolvedValue(returnValue);
  c['orderBy'] = vi.fn().mockResolvedValue(returnValue);
  return c;
}

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  execute: vi.fn(),
};
const mockDrizzle = { db: mockDb };

describe('CpdService', () => {
  let service: CpdService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CpdService(mockDrizzle as never);
  });

  describe('logManual', () => {
    it('creates a CPD log entry', async () => {
      const entry = { id: 'log-1', hours: '3', activityDescription: 'Webinar', userId: 'u1' };
      const chain = makeChain([entry]);
      mockDb.insert.mockReturnValue(chain);

      const result = await service.logManual('u1', { hours: 3, activityDescription: 'Webinar' });
      expect(result).toEqual(entry);
      expect(chain['values']).toHaveBeenCalledWith(
        expect.objectContaining({ hours: '3', activityDescription: 'Webinar', userId: 'u1' }),
      );
    });

    it('uses provided loggedAt date', async () => {
      const chain = makeChain([{ id: 'log-2' }]);
      mockDb.insert.mockReturnValue(chain);
      const customDate = new Date('2025-03-15');

      await service.logManual('u1', { hours: 2, activityDescription: 'Seminar', loggedAt: customDate });

      const call = (chain['values'] as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { loggedAt: Date } | undefined;
      expect(call?.loggedAt).toEqual(customDate);
    });
  });

  describe('getSummary', () => {
    it('returns year, totalHours and requirements for all bodies', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ total: '25' }])
        .mockResolvedValueOnce([]);

      const result = await service.getSummary('u1');
      expect(result.year).toBe(new Date().getFullYear());
      expect(result.totalHours).toBe(25);
      expect(result.requirements).toHaveLength(5);
      expect(result.requirements.map((r) => r.body)).toContain('ICAEW');
      expect(result.requirements.map((r) => r.body)).toContain('ACCA');
    });

    it('marks requirement as met when hours >= target', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ total: '50' }])
        .mockResolvedValueOnce([]);

      const result = await service.getSummary('u1');
      const icaew = result.requirements.find((r) => r.body === 'ICAEW');
      expect(icaew?.met).toBe(true);
      expect(icaew?.percentage).toBe(100);
    });

    it('calculates partial percentage correctly', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ total: '20' }])
        .mockResolvedValueOnce([]);

      const result = await service.getSummary('u1');
      const icaew = result.requirements.find((r) => r.body === 'ICAEW');
      expect(icaew?.percentage).toBe(50);
      expect(icaew?.met).toBe(false);
      expect(icaew?.remaining).toBe(20);
    });
  });

  describe('getMyCpdLog', () => {
    it('groups log entries by year', async () => {
      const entries = [
        { id: 'l1', hours: '5', loggedAt: new Date('2025-03-01'), activityDescription: 'Course', courseTitle: 'IFRS', courseSlug: 'ifrs' },
        { id: 'l2', hours: '3', loggedAt: new Date('2025-06-15'), activityDescription: 'Webinar', courseTitle: null, courseSlug: null },
      ];
      mockDb.select.mockReturnValue(makeChain(entries));

      const result = await service.getMyCpdLog('u1');
      expect(result.log).toHaveLength(2);
      expect(result.byYear[2025]).toBeDefined();
      expect(result.byYear[2025]?.hours).toBe(8);
    });
  });
});
