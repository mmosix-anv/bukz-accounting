import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  jobApplications: {
    id: 'id',
    jobId: 'job_id',
    candidateId: 'candidate_id',
    status: 'status',
    coverLetter: 'cover_letter',
    createdAt: 'created_at',
  },
  candidates: { id: 'id', userId: 'user_id', cvUrl: 'cv_url' },
  jobListings: { id: 'id', employerId: 'employer_id', title: 'title' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  and: vi.fn((...args) => ({ args, op: 'and' })),
  desc: vi.fn((col) => ({ col, dir: 'desc' })),
  inArray: vi.fn((col, vals) => ({ col, vals, op: 'inArray' })),
}));

import { JobApplicationsService } from './job-applications.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

function makeChain(returnValue: unknown) {
  const c: Record<string, unknown> = {};
  c['from'] = vi.fn().mockReturnValue(c);
  c['where'] = vi.fn().mockReturnValue(c);
  c['orderBy'] = vi.fn().mockReturnValue(c);
  c['limit'] = vi.fn().mockResolvedValue(returnValue);
  c['set'] = vi.fn().mockReturnValue(c);
  c['values'] = vi.fn().mockReturnValue(c);
  c['returning'] = vi.fn().mockResolvedValue(returnValue);
  c['innerJoin'] = vi.fn().mockReturnValue(c);
  c['select'] = vi.fn().mockReturnValue(c);
  return c;
}

const mockDb = { select: vi.fn(), insert: vi.fn(), update: vi.fn() };
const mockListingsService = { incrementApplications: vi.fn().mockResolvedValue(undefined) };
const mockDrizzle = { db: mockDb };

describe('JobApplicationsService', () => {
  let service: JobApplicationsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new JobApplicationsService(mockDrizzle as never, mockListingsService as never);
  });

  describe('apply', () => {
    it('throws BadRequestException when candidate profile does not exist', async () => {
      mockDb.select.mockReturnValue(makeChain([]));
      await expect(service.apply('user-1', 'job-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when candidate has no CV', async () => {
      const candidate = { id: 'c1', userId: 'user-1', cvUrl: null };
      mockDb.select.mockReturnValue(makeChain([candidate]));
      await expect(service.apply('user-1', 'job-1')).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException on duplicate application', async () => {
      const candidate = { id: 'c1', userId: 'user-1', cvUrl: 'https://s3.example.com/cv.pdf' };
      const existingApp = { id: 'a1' };

      mockDb.select
        .mockReturnValueOnce(makeChain([candidate]))
        .mockReturnValueOnce(makeChain([existingApp]));

      await expect(service.apply('user-1', 'job-1')).rejects.toThrow(ConflictException);
    });

    it('creates application and increments count on success', async () => {
      const candidate = { id: 'c1', userId: 'user-1', cvUrl: 'https://s3.example.com/cv.pdf' };
      const application = { id: 'a1', jobId: 'job-1', candidateId: 'c1', status: 'submitted' };

      mockDb.select
        .mockReturnValueOnce(makeChain([candidate]))
        .mockReturnValueOnce(makeChain([]));
      mockDb.insert.mockReturnValue(makeChain([application]));

      const result = await service.apply('user-1', 'job-1', 'I am a great fit');
      expect(result).toEqual(application);
      expect(mockListingsService.incrementApplications).toHaveBeenCalledWith('job-1');
    });
  });

  describe('updateStatus', () => {
    it('updates application status and returns updated record', async () => {
      const updated = { id: 'a1', status: 'shortlisted' };
      mockDb.update.mockReturnValue(makeChain([updated]));

      const result = await service.updateStatus('a1', 'shortlisted');
      expect(result).toEqual(updated);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
