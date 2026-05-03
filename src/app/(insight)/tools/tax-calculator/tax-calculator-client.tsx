'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const schema = z.object({
  annualIncome: z.coerce.number().min(1, 'Enter your annual income').max(10_000_000, 'Income too large'),
  pensionContribution: z.coerce.number().min(0).max(10_000_000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface TaxResult {
  grossIncome: number;
  personalAllowance: number;
  taxableIncome: number;
  basicRateTax: number;
  higherRateTax: number;
  additionalRateTax: number;
  totalTax: number;
  nationalInsurance: number;
  takeHomePay: number;
  effectiveRate: number;
}

function fmt(n: number, period: 'annual' | 'monthly' | 'weekly'): string {
  const divisor = period === 'monthly' ? 12 : period === 'weekly' ? 52 : 1;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(
    n / divisor,
  );
}

const CHART_COLOURS = ['#0f2a2e', '#2cd7f2', '#64748b'];

export function TaxCalculatorClient() {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [period, setPeriod] = useState<'annual' | 'monthly' | 'weekly'>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/v1/insight/tools/tax-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annualIncome: values.annualIncome,
          pensionContribution: values.pensionContribution ?? 0,
        }),
      });
      if (!res.ok) throw new Error('Calculation failed');
      const data = await res.json() as TaxResult;
      setResult(data);
    } catch {
      setError('Could not calculate — please try again.');
    } finally {
      setLoading(false);
    }
  }

  const chartData = result
    ? [
        { name: 'Take-home', value: Math.round(result.takeHomePay) },
        { name: 'Income Tax', value: Math.round(result.totalTax) },
        { name: 'NI', value: Math.round(result.nationalInsurance) },
      ]
    : [];

  const rows: [string, (r: TaxResult) => string, string?][] = [
    ['Gross income', (r) => fmt(r.grossIncome, period)],
    ['Personal allowance', (r) => fmt(r.personalAllowance, period)],
    ['Taxable income', (r) => fmt(r.taxableIncome, period)],
    ['Basic rate tax (20%)', (r) => fmt(r.basicRateTax, period)],
    ['Higher rate tax (40%)', (r) => fmt(r.higherRateTax, period)],
    ['Additional rate tax (45%)', (r) => fmt(r.additionalRateTax, period)],
    ['Total income tax', (r) => fmt(r.totalTax, period)],
    ['National Insurance', (r) => fmt(r.nationalInsurance, period)],
    ['Take-home pay', (r) => fmt(r.takeHomePay, period), 'green'],
    ['Effective tax rate', (r) => `${r.effectiveRate.toFixed(1)}%`],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="annualIncome">
              Annual salary (£ GBP)
            </label>
            <input
              id="annualIncome"
              type="number"
              placeholder="e.g. 55000"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              {...register('annualIncome')}
            />
            {errors.annualIncome && (
              <p className="mt-1 text-xs text-red-600">{errors.annualIncome.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="pension">
              Pension contribution (£ GBP/year, optional)
            </label>
            <input
              id="pension"
              type="number"
              placeholder="e.g. 3000"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              {...register('pensionContribution')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Calculating…' : 'Calculate take-home pay'}
          </button>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
        </form>
      </div>

      {result && (
        <>
          <div className="flex gap-2">
            {(['annual', 'monthly', 'weekly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
                  period === p ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-primary mb-4">
                Breakdown ({period}, GBP)
              </h2>
              <div className="space-y-2.5">
                {rows.map(([label, fn, colour]) => {
                  const val = fn(result);
                  const isZero = val === fmt(0, period) || val === '0%';
                  if (isZero && label.includes('rate tax')) return null;
                  return (
                    <div key={label} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                      <span className="text-slate-600">{label}</span>
                      <span
                        className={`font-semibold ${
                          colour === 'green' ? 'text-green-600 text-base' : 'text-primary'
                        }`}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-primary mb-4">Income split</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={index} fill={CHART_COLOURS[index % CHART_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
                    }
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Figures are estimates for the 2025/26 tax year. Does not include student loan, marriage allowance or other deductions. Not financial advice.
          </p>
        </>
      )}
    </div>
  );
}
