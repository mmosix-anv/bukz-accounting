'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const schema = z.object({
  title: z.string().min(2, 'Enter a job title'),
  location: z.string().min(1, 'Select a location'),
  experienceLevel: z.string().min(1, 'Select an experience level'),
  yourSalary: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface BenchmarkResult {
  percentile25: number;
  median: number;
  percentile75: number;
  sampleSize: number;
}

const LOCATIONS = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol', 'Liverpool', 'Remote'];
const LEVELS = [
  { value: 'entry', label: 'Entry level' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
  { value: 'director', label: 'Director' },
  { value: 'cfo', label: 'CFO / FD' },
];

function fmt(n: number | undefined) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

function getMarketPosition(yourSalary: number | undefined, result: BenchmarkResult): { label: string; colour: string } | null {
  if (!yourSalary || !result.median) return null;
  if (yourSalary < result.percentile25) return { label: 'Below market (bottom 25%)', colour: 'text-red-600' };
  if (yourSalary < result.median) return { label: 'Below median', colour: 'text-amber-600' };
  if (yourSalary < result.percentile75) return { label: 'At or above median', colour: 'text-green-600' };
  return { label: 'Above market (top 25%)', colour: 'text-green-700' };
}

export function SalaryBenchmarkerClient() {
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSalary, setSubmittedSalary] = useState<number | undefined>();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { location: 'London', experienceLevel: 'mid' },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    setSubmittedSalary(values.yourSalary);
    try {
      const params = new URLSearchParams({
        title: values.title,
        location: values.location,
        experienceLevel: values.experienceLevel,
      });
      const res = await fetch(`/api/v1/insight/tools/salary-benchmark?${params}`);
      if (!res.ok) throw new Error('Benchmark failed');
      const data = await res.json() as BenchmarkResult;
      setResult(data);
    } catch {
      setError('Could not fetch benchmark data — please try again.');
    } finally {
      setLoading(false);
    }
  }

  const chartData = result
    ? [
        { label: '25th percentile', value: result.percentile25, fill: '#94a3b8' },
        { label: 'Median', value: result.median, fill: '#0f2a2e' },
        { label: '75th percentile', value: result.percentile75, fill: '#94a3b8' },
        ...(submittedSalary ? [{ label: 'Your salary', value: submittedSalary, fill: '#2cd7f2' }] : []),
      ]
    : [];

  const marketPosition = result && submittedSalary ? getMarketPosition(submittedSalary, result) : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="title">
              Job title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Management Accountant, Tax Manager"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="location">
                Location
              </label>
              <select
                id="location"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                {...register('location')}
              >
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="level">
                Experience level
              </label>
              <select
                id="level"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                {...register('experienceLevel')}
              >
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="yourSalary">
              Your current salary (£ GBP, optional — for comparison)
            </label>
            <input
              id="yourSalary"
              type="number"
              placeholder="e.g. 55000"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              {...register('yourSalary')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Fetching data…' : 'Get salary benchmark'}
          </button>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
        </form>
      </div>

      {result && (
        <div className="space-y-5">
          {marketPosition && (
            <div className={`rounded-xl border-2 p-4 text-center ${marketPosition.colour.includes('red') ? 'border-red-200 bg-red-50' : marketPosition.colour.includes('amber') ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
              <p className={`text-lg font-bold ${marketPosition.colour}`}>{marketPosition.label}</p>
              <p className="text-sm text-slate-600 mt-1">
                Your salary of {fmt(submittedSalary)} vs market median of {fmt(result.median)}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-primary mb-1">Market salary data (GBP)</h2>
            {result.sampleSize > 0 ? (
              <>
                <p className="text-xs text-slate-400 mb-5">Based on {result.sampleSize} live job listings</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number) => [fmt(v), 'Salary (GBP)']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    {submittedSalary && result.median && (
                      <ReferenceLine y={submittedSalary} stroke="#2cd7f2" strokeDasharray="4 4" label={{ value: 'You', fill: '#2cd7f2', fontSize: 11 }} />
                    )}
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  {[
                    { label: '25th percentile', value: result.percentile25 },
                    { label: 'Median', value: result.median },
                    { label: '75th percentile', value: result.percentile75 },
                  ].map((p) => (
                    <div key={p.label} className="text-center">
                      <p className="text-lg font-bold text-primary">{fmt(p.value)}</p>
                      <p className="text-xs text-slate-500">{p.label}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-500 text-sm">No data available for this combination yet.</p>
                <p className="text-slate-400 text-xs mt-1">Try a broader job title or different location.</p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center">
            Data sourced from live BUKZ Jobs listings. Updated continuously. For guidance only.
          </p>
        </div>
      )}
    </div>
  );
}
