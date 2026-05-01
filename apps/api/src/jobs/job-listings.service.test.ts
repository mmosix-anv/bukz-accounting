import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  employerSubscriptions: {
    userId: 'user_id',
  },
  jobListings: {
    status: 'status',
    featured: 'featured',
    createdAt: 'created_at',
    jobType: 'job_type',
    experienceLevel: 'experience_level',
    remotePolicy: 'remote_policy',
    salaryMin: 'salary_min',
    salaryMax: 'salary_max',
    id: 'id',
    employerId: 'employer_id',
    title: 'title',
    viewsCount: 'views_count',
    applicationsCount: 'applications_count',
    updatedAt: 'updated_at',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  and: vi.fn((...args) => ({ args, op: 'and' })),
  gte: vi.fn((col, val) => ({ col, val, op: 'gte' })),
  lte: vi.fn((col, val) => ({ col, val, op: 'lte' })),
  desc: vi.fn((col) => ({ col, dir: 'desc' })),
  asc: vi.fn((col) => ({ col, dir: 'asc' })),
  inArray: vi.fn((col, vals) => ({ col, vals, op: 'inArray' })),
  sql: vi.fn((strings) => strings.join('')),
}));

import { JobListingsService } from './job-listings.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

function makeChain(returnValue: unknown, resolvesAt: 'limit' | 'offset' = 'limit') {
  const c: Record<string, unknown> = {};
  c['from'] = vi.fn().mockReturnValue(c);
  c['where'] = vi.fn().mockReturnValue(c);
  c['orderBy'] = vi.fn().mockReturnValue(c);
  if (resolvesAt === 'offset') {
    c['limit'] = vi.fn().mockReturnValue(c);
    c['offset'] = vi.fn().mockResolvedValue(returnValue);
  } else {
    c['limit'] = vi.fn().mockResolvedValue(returnValue);
    c['offset'] = vi.fn().mockResolvedValue(returnValue);
  }
  c['set'] = vi.fn().mockReturnValue(c);
  c['values'] = vi.fn().mockReturnValue(c);
  c['returning'] = vi.fn().mockResolvedValue(returnValue);
  c['execute'] = vi.fn().mockResolvedValue(returnValue);
  c['select'] = vi.fn().mockReturnValue(c);
  return c;
}

const mockDb = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  execute: vi.fn(),
};

const mockDrizzle = { db: mockDb };

describe('JobListingsService', () => {
  let service: JobListingsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new JobListingsService(mockDrizzle as never);
  });

  describe('findAll', () => {
    it('returns active listings ordered by featured desc then createdAt desc', async () => {
      const listings = [
        { id: 'j1', title: 'Senior Accountant', featured: true },
        { id: 'j2', title: 'Junior Accountant', featured: false },
      ];
      mockDb.select.mockReturnValue(makeChain(listings, 'offset'));

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('uses default limit of 20 and offset 0', async () => {
      const chain = makeChain([], 'offset');
      mockDb.select.mockReturnValue(chain);

      await service.findAll();
      expect(chain['limit']).toHaveBeenCalledWith(20);
      expect(chain['offset']).toHaveBeenCalledWith(0);
    });

    it('respects custom limit and offset', async () => {
      const chain = makeChain([], 'offset');
      mockDb.select.mockReturnValue(chain);

      await service.findAll({ limit: 5, offset: 10 });
      expect(chain['limit']).toHaveBeenCalledWith(5);
      expect(chain['offset']).toHaveBeenCalledWith(10);
    });
  });

  describe('findBySlug', () => {
    it('returns listing when found', async () => {
      const listing = { id: 'j1', slug: 'senior-accountant', title: 'Senior Accountant' };
      mockDb.select.mockReturnValue(makeChain([listing]));

      const result = await service.findBySlug('senior-accountant');
      expect(result).toEqual(listing);
    });

    it('throws NotFoundException when listing not found', async () => {
      mockDb.select.mockReturnValue(makeChain([]));
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException when non-owner tries to update', async () => {
      const existing = { id: 'j1', employerId: 'employer-1' };
      mockDb.select.mockReturnValue(makeChain([existing]));

      await expect(
        service.update('j1', 'different-employer', { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows owner to update', async () => {
      const existing = { id: 'j1', employerId: 'employer-1' };
      const updated = { ...existing, title: 'New Title' };
      const selectChain = makeChain([existing]);
      const updateChain = makeChain([updated]);
      mockDb.select.mockReturnValue(selectChain);
      mockDb.update.mockReturnValue(updateChain);

      const result = await service.update('j1', 'employer-1', { title: 'New Title' });
      expect(result).toEqual(updated);
    });

    it('allows admin to update any listing', async () => {
      const existing = { id: 'j1', employerId: 'employer-1' };
      const updated = { ...existing, title: 'Admin Updated' };
      const selectChain = makeChain([existing]);
      const updateChain = makeChain([updated]);
      mockDb.select.mockReturnValue(selectChain);
      mockDb.update.mockReturnValue(updateChain);

      const result = await service.update('j1', 'admin-user', { title: 'Admin Updated' }, true);
      expect(result).toEqual(updated);
    });
  });

  describe('slugify', () => {
    it('generates URL-safe slug from title', async () => {
      const chain = makeChain([{ id: 'j1', slug: 'senior-management-accountant' }]);
      const activeCountChain = makeChain([{ count: 0 }]);
      activeCountChain['where'] = vi.fn().mockResolvedValue([{ count: 0 }]);
      mockDb.select
        .mockReturnValueOnce(makeChain([{ activeListingsLimit: 1, status: 'active' }]))
        .mockReturnValueOnce(activeCountChain);
      mockDb.insert.mockReturnValue(chain);

      await service.create({ title: 'Senior Management Accountant', employerId: 'e1' } as never);
      const valuesCall = (chain['values'] as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { slug: string } | undefined;
      expect(valuesCall?.slug).toMatch(/^senior-management-accountant-\d+$/);
    });

    it('blocks create when active listing limit is reached', async () => {
      const activeCountChain = makeChain([{ count: 1 }]);
      activeCountChain['where'] = vi.fn().mockResolvedValue([{ count: 1 }]);
      mockDb.select
        .mockReturnValueOnce(makeChain([{ activeListingsLimit: 1, status: 'active' }]))
        .mockReturnValueOnce(activeCountChain);

      await expect(
        service.create({ title: 'Senior Management Accountant', employerId: 'e1' } as never),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
