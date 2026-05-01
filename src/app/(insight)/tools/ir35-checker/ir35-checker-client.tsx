'use client';

import { useState } from 'react';
import Link from 'next/link';

const QUESTIONS = [
  { key: 'substitution', label: 'Can you send a substitute to do the work in your place?' },
  { key: 'control', label: 'Does the client control where, when and how you work?' },
  { key: 'moo', label: 'Are you obliged to accept work when offered (Mutuality of Obligation)?' },
  { key: 'equipment', label: 'Does the client provide your equipment?' },
  { key: 'financial_risk', label: 'Do you bear financial risk if the project overruns or goes wrong?' },
  { key: 'integration', label: 'Are you integrated into the client\'s organisation (team meetings, internal comms)?' },
  { key: 'exclusivity', label: 'Do you work exclusively for one client?' },
  { key: 'length', label: 'Is the engagement ongoing with no defined end date?' },
  { key: 'payment_method', label: 'Are you paid by the hour/day rather than by deliverable?' },
  { key: 'benefits', label: 'Does the client provide holiday pay, sick pay or pension contributions?' },
  { key: 'notice', label: 'Can the client terminate the engagement with short notice (under 1 month)?' },
  { key: 'personal_service', label: 'Is the contract specifically for your personal service (not a company)?' },
  { key: 'mutiple_clients', label: 'Do you currently work for multiple clients simultaneously?' },
  { key: 'own_insurance', label: 'Do you hold your own professional indemnity insurance?' },
  { key: 'business_premises', label: 'Do you use your own business premises or home office?' },
];

interface Ir35Result {
  riskLevel: 'inside' | 'borderline' | 'outside';
  score: number;
  reasoning: string[];
  recommendations: string[];
}

const RISK_CONFIG = {
  inside: { label: 'Inside IR35', bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-600', icon: '⚠️' },
  borderline: { label: 'Borderline', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-500', icon: '⚡' },
  outside: { label: 'Outside IR35', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-600', icon: '✓' },
};

export function Ir35CheckerClient() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<Ir35Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = Object.keys(answers).length;
  const allAnswered = answered === QUESTIONS.length;

  function setAnswer(key: string, value: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  }

  async function checkStatus() {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/v1/insight/tools/ir35-checker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error('Check failed');
      const data = await res.json() as Ir35Result;
      setResult(data);
      setTimeout(() => {
        document.getElementById('ir35-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setError('Could not process your answers — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{answered} of {QUESTIONS.length} answered</span>
        <div className="h-2 w-48 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-accent transition-all"
            style={{ width: `${(answered / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {QUESTIONS.map((q, i) => (
        <div
          key={q.key}
          className={`rounded-xl border p-4 transition-colors ${
            answers[q.key] !== undefined ? 'border-primary/20 bg-primary/5' : 'border-slate-200'
          }`}
        >
          <p className="text-sm font-medium text-slate-700 mb-3">
            {i + 1}. {q.label}
          </p>
          <div className="flex gap-3">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ].map(({ value, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setAnswer(q.key, value)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  answers[q.key] === value
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 text-slate-600 hover:border-primary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={checkStatus}
        disabled={!allAnswered || loading}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading
          ? 'Analysing…'
          : !allAnswered
            ? `Answer all questions (${QUESTIONS.length - answered} remaining)`
            : 'Check my IR35 status'}
      </button>

      {error && <p className="text-sm text-center text-red-600">{error}</p>}

      {result && (
        <div id="ir35-result" className={`rounded-xl border-2 p-6 ${RISK_CONFIG[result.riskLevel].bg} ${RISK_CONFIG[result.riskLevel].border}`}>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{RISK_CONFIG[result.riskLevel].icon}</span>
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold text-white ${RISK_CONFIG[result.riskLevel].badge}`}>
                {RISK_CONFIG[result.riskLevel].label}
              </span>
              <p className={`mt-1 text-sm ${RISK_CONFIG[result.riskLevel].text}`}>
                Risk score: {result.score}%
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className={`text-sm font-semibold mb-2 ${RISK_CONFIG[result.riskLevel].text}`}>Assessment</h3>
            <ul className="space-y-1">
              {result.reasoning.map((r, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">•</span> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-5">
            <h3 className={`text-sm font-semibold mb-2 ${RISK_CONFIG[result.riskLevel].text}`}>Recommendations</h3>
            <ul className="space-y-1">
              {result.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-accent">→</span> {r}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/experts"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Book an IR35 specialist consultation →
          </Link>

          <p className="mt-4 text-xs text-slate-500">
            This assessment is for guidance only and does not constitute legal or tax advice. Always consult a qualified IR35 specialist.
          </p>
        </div>
      )}
    </div>
  );
}
