import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@bukz/db', () => ({
  jobListings: {
    status: 'status',
    salaryMin: 'salary_min',
    salaryMax: 'salary_max',
    experienceLevel: 'experience_level',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  and: vi.fn((...args) => ({ args, op: 'and' })),
  isNotNull: vi.fn((col) => ({ col, op: 'isNotNull' })),
}));

import { SalaryService } from './salary.service';

function makeChain(returnValue: unknown) {
  const c: Record<string, unknown> = {};
  c['from'] = vi.fn().mockReturnValue(c);
  c['where'] = vi.fn().mockReturnValue(c);
  c['limit'] = vi.fn().mockResolvedValue(returnValue);
  c['select'] = vi.fn().mockReturnValue(c);
  return c;
}

const mockDb = { select: vi.fn() };
const mockDrizzle = { db: mockDb };

describe('SalaryService', () => {
  let service: SalaryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SalaryService(mockDrizzle as never);
  });

  it('returns null when no salary data available', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const result = await service.getBenchmark({});
    expect(result).toBeNull();
  });

  it('calculates correct salary percentiles', async () => {
    const salaries = [
      { salaryMin: '30000', salaryMax: '40000' },
      { salaryMin: '45000', salaryMax: '55000' },
      { salaryMin: '60000', salaryMax: '80000' },
      { salaryMin: '80000', salaryMax: '100000' },
    ];
    mockDb.select.mockReturnValue(makeChain(salaries));

    const result = await service.getBenchmark({});
    expect(result).not.toBeNull();
    expect(result!.percentile25).toBeLessThan(result!.median);
    expect(result!.median).toBeLessThan(result!.percentile75);
    expect(result!.sampleSize).toBe(4);
  });

  it('returns sampleSize equal to number of listings', async () => {
    const salaries = Array.from({ length: 10 }, (_, i) => ({
      salaryMin: String(30000 + i * 5000),
      salaryMax: String(40000 + i * 5000),
    }));
    mockDb.select.mockReturnValue(makeChain(salaries));

    const result = await service.getBenchmark({});
    expect(result!.sampleSize).toBe(10);
  });

  it('median index is floor(length * 0.5) for sorted midpoints', async () => {
    const salaries = [
      { salaryMin: '20000', salaryMax: '30000' },
      { salaryMin: '40000', salaryMax: '60000' },
    ];
    mockDb.select.mockReturnValue(makeChain(salaries));

    const result = await service.getBenchmark({});
    // midpoints sorted: [25000, 50000]; floor(2 * 0.5) = 1 → 50000
    expect(result!.median).toBe(50000);
    expect(result!.percentile25).toBe(25000);
  });
});
