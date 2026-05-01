import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  courses: { id: 'id', status: 'status', priceGbp: 'price_gbp', enrollmentsCount: 'enrollments_count', updatedAt: 'updated_at' },
  enrollments: { id: 'id', courseId: 'course_id', userId: 'user_id', completedAt: 'completed_at' },
  lessonProgress: { userId: 'user_id', lessonId: 'lesson_id', completed: 'completed' },
  courseLessons: { sectionId: 'section_id', id: 'id' },
  courseSections: { courseId: 'course_id', id: 'id' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  and: vi.fn((...args) => ({ args, op: 'and' })),
  sql: vi.fn((s) => s),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    paymentIntents: {
      retrieve: vi.fn().mockResolvedValue({ status: 'succeeded' }),
    },
  })),
}));

import { EnrollmentsService } from './enrollments.service';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

function makeChain(returnValue: unknown, terminal: 'limit' | 'returning' = 'limit') {
  const c: Record<string, unknown> = {};
  c['from'] = vi.fn().mockReturnValue(c);
  c['where'] = vi.fn().mockReturnValue(c);
  c['orderBy'] = vi.fn().mockReturnValue(c);
  c['innerJoin'] = vi.fn().mockReturnValue(c);
  c['select'] = vi.fn().mockReturnValue(c);
  c['set'] = vi.fn().mockReturnValue(c);
  c['values'] = vi.fn().mockReturnValue(c);
  c['execute'] = vi.fn().mockResolvedValue(returnValue);
  if (terminal === 'returning') {
    c['limit'] = vi.fn().mockReturnValue(c);
    c['returning'] = vi.fn().mockResolvedValue(returnValue);
  } else {
    c['limit'] = vi.fn().mockResolvedValue(returnValue);
    c['returning'] = vi.fn().mockResolvedValue(returnValue);
  }
  return c;
}

const mockDb = { select: vi.fn(), insert: vi.fn(), update: vi.fn(), execute: vi.fn() };
const mockDrizzle = { db: mockDb };

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EnrollmentsService(mockDrizzle as never);
  });

  describe('enrol', () => {
    it('throws NotFoundException when course not found', async () => {
      mockDb.select.mockReturnValue(makeChain([]));
      await expect(service.enrol('user-1', 'course-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when course is not published', async () => {
      mockDb.select.mockReturnValue(makeChain([{ id: 'c1', status: 'draft', priceGbp: '0' }]));
      await expect(service.enrol('user-1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException on duplicate enrollment', async () => {
      mockDb.select
        .mockReturnValueOnce(makeChain([{ id: 'c1', status: 'published', priceGbp: '0' }]))
        .mockReturnValueOnce(makeChain([{ id: 'e1' }]));
      await expect(service.enrol('user-1', 'c1')).rejects.toThrow(ConflictException);
    });

    it('creates enrollment for free course without payment intent', async () => {
      const enrollment = { id: 'e1', courseId: 'c1', userId: 'user-1', progressPercent: 0 };
      mockDb.select
        .mockReturnValueOnce(makeChain([{ id: 'c1', status: 'published', priceGbp: '0' }]))
        .mockReturnValueOnce(makeChain([]));
      const insertChain = makeChain([enrollment], 'returning');
      mockDb.insert.mockReturnValue(insertChain);
      const updateChain = makeChain([]);
      updateChain['set'] = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) });
      mockDb.update.mockReturnValue(updateChain);

      const result = await service.enrol('user-1', 'c1');
      expect(result).toEqual(enrollment);
    });

    it('throws BadRequestException for paid course without payment intent', async () => {
      mockDb.select
        .mockReturnValueOnce(makeChain([{ id: 'c1', status: 'published', priceGbp: '149' }]))
        .mockReturnValueOnce(makeChain([]));

      await expect(service.enrol('user-1', 'c1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkEnrollment', () => {
    it('returns true when user is enrolled', async () => {
      mockDb.select.mockReturnValue(makeChain([{ id: 'e1' }]));
      expect(await service.checkEnrollment('user-1', 'course-1')).toBe(true);
    });

    it('returns false when user is not enrolled', async () => {
      mockDb.select.mockReturnValue(makeChain([]));
      expect(await service.checkEnrollment('user-1', 'course-1')).toBe(false);
    });
  });
});
