import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';

const checkoutCreate = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: checkoutCreate,
      },
    },
  })),
}));

vi.mock('@bukz/db', () => ({
  employerSubscriptions: {
    userId: 'user_id',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
}));

import { PaymentsService } from './payments.service';

function makeChain(returnValue: unknown) {
  const c: Record<string, unknown> = {};
  c['from'] = vi.fn().mockReturnValue(c);
  c['where'] = vi.fn().mockReturnValue(c);
  c['limit'] = vi.fn().mockResolvedValue(returnValue);
  c['set'] = vi.fn().mockReturnValue(c);
  c['values'] = vi.fn().mockReturnValue(c);
  c['returning'] = vi.fn().mockResolvedValue(returnValue);
  return c;
}

const mockDb = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PaymentsService({ db: mockDb } as never);
  });

  it('creates employer subscription checkout sessions', async () => {
    const session = { id: 'cs_123', url: 'https://stripe.example/session' };
    checkoutCreate.mockResolvedValue(session);

    const result = await service.createEmployerSubscriptionCheckout('user-1', 'pro');

    expect(result).toEqual(session);
    expect(checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        metadata: { userId: 'user-1', tier: 'pro', productType: 'employer_subscription' },
      }),
    );
  });

  it('rejects invalid employer subscription tiers', async () => {
    await expect(
      service.createEmployerSubscriptionCheckout('user-1', 'free' as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns the current employer subscription', async () => {
    const subscription = { id: 'sub-1', tier: 'starter' };
    mockDb.select.mockReturnValue(makeChain([subscription]));

    await expect(service.getEmployerSubscription('user-1')).resolves.toEqual(subscription);
  });
});
