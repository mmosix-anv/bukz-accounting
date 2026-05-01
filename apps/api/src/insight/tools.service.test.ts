import { describe, it, expect, vi } from 'vitest';

vi.mock('@bukz/db', () => ({
  jobListings: {},
}));

import { ToolsService } from './tools.service';

const mockDrizzleService = {
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
};

const service = new ToolsService(mockDrizzleService as unknown as ConstructorParameters<typeof ToolsService>[0]);

describe('ToolsService.calculateTax', () => {
  it('returns correct take-home for £50,000 salary', () => {
    const result = service.calculateTax({ annualIncome: 50_000 });

    expect(result.grossIncome).toBe(50_000);
    expect(result.personalAllowance).toBe(12_570);
    expect(result.taxableIncome).toBe(37_430);
    expect(result.basicRateTax).toBeCloseTo(7_486, 0);
    expect(result.higherRateTax).toBe(0);
    expect(result.additionalRateTax).toBe(0);
    expect(result.takeHomePay).toBeGreaterThan(38_000);
    expect(result.takeHomePay).toBeLessThan(43_000);
  });

  it('applies higher rate tax above £50,270', () => {
    const result = service.calculateTax({ annualIncome: 80_000 });
    expect(result.higherRateTax).toBeGreaterThan(0);
    expect(result.basicRateTax).toBeCloseTo(7_540, 0);
  });

  it('deducts pension contribution before calculating tax', () => {
    const withPension = service.calculateTax({ annualIncome: 50_000, pensionContribution: 5_000 });
    const withoutPension = service.calculateTax({ annualIncome: 50_000 });

    expect(withPension.grossIncome).toBe(45_000);
    expect(withPension.totalTax).toBeLessThan(withoutPension.totalTax);
  });

  it('zero tax below personal allowance', () => {
    const result = service.calculateTax({ annualIncome: 12_000 });
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });

  it('applies additional rate above £125,140', () => {
    const result = service.calculateTax({ annualIncome: 150_000 });
    expect(result.additionalRateTax).toBeGreaterThan(0);
  });

  it('effective rate is between 0 and 100', () => {
    const result = service.calculateTax({ annualIncome: 60_000 });
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(100);
  });
});

describe('ToolsService.checkIr35', () => {
  it('returns inside when majority of answers are positive', () => {
    const answers: Record<string, boolean> = {};
    for (let i = 0; i < 10; i++) answers[`q${i}`] = true;
    for (let i = 10; i < 15; i++) answers[`q${i}`] = false;

    const result = service.checkIr35({ answers });
    expect(result.riskLevel).toBe('inside');
    expect(result.score).toBeGreaterThan(60);
  });

  it('returns outside when few answers are positive', () => {
    const answers: Record<string, boolean> = {};
    for (let i = 0; i < 3; i++) answers[`q${i}`] = true;
    for (let i = 3; i < 15; i++) answers[`q${i}`] = false;

    const result = service.checkIr35({ answers });
    expect(result.riskLevel).toBe('outside');
  });

  it('returns borderline for mid-range answers', () => {
    const answers: Record<string, boolean> = {};
    for (let i = 0; i < 7; i++) answers[`q${i}`] = true;
    for (let i = 7; i < 15; i++) answers[`q${i}`] = false;

    const result = service.checkIr35({ answers });
    expect(result.riskLevel).toBe('borderline');
  });

  it('always returns recommendations array', () => {
    const result = service.checkIr35({ answers: { q1: true } });
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
