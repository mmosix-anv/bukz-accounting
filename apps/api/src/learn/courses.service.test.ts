import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  courses: { id: 'id', status: 'status', instructorId: 'instructor_id', title: 'title', slug: 'slug', priceGbp: 'price_gbp', enrollmentsCount: 'enrollments_count', ratingAvg: 'rating_avg', createdAt: 'created_at', updatedAt: 'updated_at', cpdHours: 'cpd_hours', level: 'level' },
  courseSections: { id: 'id', courseId: 'course_id', title: 'title', position: 'position' },
  courseLessons: { id: 'id', sectionId: 'section_id', position: 'position', isFree: 'is_free' },
  courseCategories: {},
  users: { id: 'id', name: 'name', avatarUrl: 'avatar_url' },
  enrollments: { id: 'id', courseId: 'course_id', userId: 'user_id', completedAt: 'completed_at', progressPercent: 'progress_percent' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  and: vi.fn((...args) => ({ args, op: 'and' })),
  gte: vi.fn((col, val) => ({ col, val, op: 'gte' })),
  lte: vi.fn((col, val) => ({ col, val, op: 'lte' })),
  desc: vi.fn((col) => ({ col, dir: 'desc' })),
  asc: vi.fn((col) => ({ col, dir: 'asc' })),
  avg: vi.fn((col) => ({ col, fn: 'avg' })),
  sql: Object.assign(vi.fn((s) => s), { join: vi.fn() }),
}));

import { CoursesService } from './courses.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

function makeChain(returnValue: unknown, terminal: 'limit' | 'offset' | 'returning' = 'limit') {
  const c: Record<string, unknown> = {};
  c['from'] = vi.fn().mockReturnValue(c);
  c['where'] = vi.fn().mockReturnValue(c);
  c['orderBy'] = vi.fn().mockReturnValue(c);
  c['leftJoin'] = vi.fn().mockReturnValue(c);
  c['innerJoin'] = vi.fn().mockReturnValue(c);
  c['select'] = vi.fn().mockReturnValue(c);
  c['set'] = vi.fn().mockReturnValue(c);
  c['values'] = vi.fn().mockReturnValue(c);
  c['execute'] = vi.fn().mockResolvedValue(returnValue);

  if (terminal === 'offset') {
    c['limit'] = vi.fn().mockReturnValue(c);
    c['offset'] = vi.fn().mockResolvedValue(returnValue);
  } else if (terminal === 'returning') {
    c['limit'] = vi.fn().mockReturnValue(c);
    c['offset'] = vi.fn().mockReturnValue(c);
    c['returning'] = vi.fn().mockResolvedValue(returnValue);
  } else {
    c['limit'] = vi.fn().mockResolvedValue(returnValue);
    c['offset'] = vi.fn().mockReturnValue(c);
    c['returning'] = vi.fn().mockResolvedValue(returnValue);
  }
  return c;
}

const mockDb = { select: vi.fn(), insert: vi.fn(), update: vi.fn(), execute: vi.fn() };
const mockDrizzle = { db: mockDb };

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CoursesService(mockDrizzle as never);
  });

  describe('findById', () => {
    it('returns course when found', async () => {
      const course = { id: 'c1', title: 'Tax Fundamentals', status: 'published' };
      mockDb.select.mockReturnValue(makeChain([course]));
      const result = await service.findById('c1');
      expect(result).toEqual(course);
    });

    it('throws NotFoundException when course missing', async () => {
      mockDb.select.mockReturnValue(makeChain([]));
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates course with draft status and auto-generated slug', async () => {
      const chain = makeChain([{ id: 'c1', slug: 'test-course', status: 'draft' }], 'returning');
      mockDb.insert.mockReturnValue(chain);

      const result = await service.create('instructor-1', {
        title: 'Test Course',
        description: 'A test',
        shortDescription: 'Short',
        level: 'beginner',
        priceGbp: '99',
        cpdHours: '2',
        status: 'draft',
      });

      expect(result).toBeDefined();
      const valuesCall = (chain['values'] as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { status: string; instructorId: string; slug: string } | undefined;
      expect(valuesCall?.status).toBe('draft');
      expect(valuesCall?.instructorId).toBe('instructor-1');
      expect(valuesCall?.slug).toMatch(/test-course-\d+/);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException when non-owner updates', async () => {
      mockDb.select.mockReturnValue(makeChain([{ id: 'c1', instructorId: 'inst-1' }]));
      await expect(service.update('c1', 'inst-2', { title: 'New' })).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to update any course', async () => {
      const course = { id: 'c1', instructorId: 'inst-1', title: 'Original' };
      const updated = { ...course, title: 'Updated' };
      mockDb.select.mockReturnValue(makeChain([course]));
      const updateChain = makeChain([updated], 'returning');
      mockDb.update.mockReturnValue(updateChain);

      const result = await service.update('c1', 'admin-user', { title: 'Updated' }, true);
      expect(result).toEqual(updated);
    });
  });

  describe('publish', () => {
    it('throws ForbiddenException when non-owner tries to publish', async () => {
      mockDb.select.mockReturnValue(makeChain([{ id: 'c1', instructorId: 'inst-1' }]));
      await expect(service.publish('c1', 'inst-2')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when course has no sections', async () => {
      mockDb.select
        .mockReturnValueOnce(makeChain([{ id: 'c1', instructorId: 'inst-1' }]))
        .mockReturnValueOnce(makeChain([]));
      await expect(service.publish('c1', 'inst-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('slugify', () => {
    it('produces URL-safe slugs', async () => {
      const chain = makeChain([{ id: 'new', slug: 'advanced-vat-guide' }], 'returning');
      mockDb.insert.mockReturnValue(chain);

      await service.create('i1', {
        title: 'Advanced VAT Guide!',
        description: '',
        shortDescription: '',
        level: 'advanced',
        priceGbp: '0',
        cpdHours: '4',
        status: 'draft',
      });

      const call = (chain['values'] as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { slug: string } | undefined;
      expect(call?.slug).toMatch(/^advanced-vat-guide-\d+$/);
    });
  });
});
