'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  enrollmentsCount: number;
  ratingAvg: string | null;
  ratingCount: number;
  priceGbp: string;
  cpdHours: string;
  level: string;
  createdAt: string;
}

interface Analytics {
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  revenueGbp: number;
  averageProgress: number;
}

interface Props {
  courses: Course[];
  token: string | undefined;
}

const STATUS_BADGES: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-slate-100 text-slate-600',
  archived: 'bg-red-100 text-red-600',
};

function generateEnrollmentChartData(courses: Course[]) {
  const days: { date: string; enrollments: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const onDay = courses.reduce((s, c) => {
      const created = new Date(c.createdAt);
      return s + (created.toDateString() === d.toDateString() ? c.enrollmentsCount : 0);
    }, 0);
    days.push({ date: label, enrollments: onDay });
  }
  return days;
}

export function InstructorDashboardClient({ courses, token }: Props) {
  const [tab, setTab] = useState<'courses' | 'create' | 'analytics'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const totalRevenue = courses.reduce((s, c) => s + Number(c.priceGbp) * c.enrollmentsCount, 0);
  const totalEnrollments = courses.reduce((s, c) => s + c.enrollmentsCount, 0);

  async function loadAnalytics(course: Course) {
    setSelectedCourse(course);
    setTab('analytics');
    const data = await apiFetch<Analytics>(`/learn/courses/${course.id}/analytics`, { token });
    setAnalytics(data);
  }

  async function togglePublish(course: Course) {
    const action = course.status === 'published' ? 'unpublish' : 'publish';
    await apiFetch(`/learn/courses/${course.id}/${action}`, { method: 'POST', token });
    setConfirmToggle(null);
    window.location.reload();
  }

  async function createCourse() {
    if (!newCourseTitle.trim()) return;
    setCreating(true);
    try {
      const course = await apiFetch<{ slug: string }>('/learn/courses', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: newCourseTitle,
          description: '',
          shortDescription: '',
          level: 'beginner',
          priceGbp: '0',
          cpdHours: '1',
        }),
      });
      window.location.href = `/learn/${course.slug}`;
    } finally {
      setCreating(false);
    }
  }

  const chartData = generateEnrollmentChartData(courses);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Published courses', value: courses.filter((c) => c.status === 'published').length, icon: '📚' },
          { label: 'Total enrollments', value: totalEnrollments, icon: '👥' },
          { label: 'Revenue (GBP)', value: `£${totalRevenue.toLocaleString('en-GB')}`, icon: '💰' },
          { label: 'Draft courses', value: courses.filter((c) => c.status === 'draft').length, icon: '✏️' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'courses', label: 'My Courses' },
            { key: 'create', label: '+ New Course' },
            { key: 'analytics', label: 'Analytics' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as 'courses' | 'create' | 'analytics')}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                tab === t.key ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'courses' && (
            courses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-500">No courses yet.</p>
                <button
                  onClick={() => setTab('create')}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Create your first course →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                    <tr>
                      {['Course', 'Status', 'Enrollments', 'Revenue (GBP)', 'Rating', 'CPD hrs', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link href={`/learn/${c.slug}`} className="font-medium text-primary hover:underline line-clamp-2 max-w-xs">
                            {c.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{c.enrollmentsCount}</td>
                        <td className="px-4 py-3">
                          £{(Number(c.priceGbp) * c.enrollmentsCount).toLocaleString('en-GB')}
                        </td>
                        <td className="px-4 py-3">
                          {c.ratingAvg ? (
                            <span className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span>{Number(c.ratingAvg).toFixed(1)}</span>
                              <span className="text-slate-400 text-xs">({c.ratingCount})</span>
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">{c.cpdHours}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 text-xs">
                            <button
                              onClick={() => setConfirmToggle(c.id)}
                              className={`font-medium hover:underline ${c.status === 'published' ? 'text-red-500' : 'text-green-600'}`}
                            >
                              {c.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              onClick={() => loadAnalytics(c)}
                              className="text-primary hover:underline"
                            >
                              Analytics
                            </button>
                            <span className="text-slate-200">|</span>
                            <Link href={`/instructors/courses/${c.id}/edit`} className="text-slate-500 hover:text-primary">
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === 'create' && (
            <div className="max-w-md space-y-4">
              <h2 className="font-semibold text-primary">Create a new course</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course title</label>
                <input
                  type="text"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Advanced Financial Reporting under IFRS"
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-slate-500">
                You can set the description, pricing, CPD hours and content after creation.
              </p>
              <button
                onClick={createCourse}
                disabled={creating || !newCourseTitle.trim()}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {creating ? 'Creating…' : 'Create course'}
              </button>
            </div>
          )}

          {tab === 'analytics' && selectedCourse && (
            <div className="space-y-6">
              <h2 className="font-semibold text-primary">{selectedCourse.title}</h2>
              {analytics ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { label: 'Total enrollments', value: analytics.totalEnrollments },
                      { label: 'Completions', value: analytics.completedEnrollments },
                      { label: 'Completion rate', value: `${analytics.completionRate}%` },
                      { label: 'Revenue (GBP)', value: `£${analytics.revenueGbp.toLocaleString('en-GB')}` },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-slate-200 p-4">
                        <p className="text-2xl font-bold text-primary">{s.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Enrollment trend (30 days)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        <Line type="monotone" dataKey="enrollments" stroke="#C9A84C" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Loading analytics…</p>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmToggle(null)} />
          <div className="relative rounded-xl bg-white p-6 shadow-xl max-w-sm w-full">
            <h2 className="font-semibold text-primary">Confirm action</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to{' '}
              {courses.find((c) => c.id === confirmToggle)?.status === 'published'
                ? 'unpublish'
                : 'publish'}{' '}
              this course?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const course = courses.find((c) => c.id === confirmToggle);
                  if (course) togglePublish(course);
                }}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
