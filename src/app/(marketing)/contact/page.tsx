import type { Metadata } from 'next';
import { Phone, Mail, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Bukz Accounting Services Ltd',
  description: 'Get in touch to discuss your accounting, advisory, or learning needs.',
};

export default function ContactPage() {
  return (
    <main className="overflow-hidden">
      {/* Header */}
      <section className="relative bg-[#0f2a2e] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Get in Touch</p>
          <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">Let&apos;s talk about your finances</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">
            Speak with us to discuss your accounting, advisory, or learning needs. We&apos;ll get back to you within one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">

          {/* Info */}
          <div>
            <h2 className="text-xl font-bold text-[#0f2a2e] dark:text-white">Contact information</h2>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              We offer a free initial consultation for new clients. Use the form or reach out directly.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2cd7f2]/10">
                  <Mail size={16} className="text-[#2cd7f2]" />
                </div>
                <span className="text-sm">hello@bukzaccounting.co.uk</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2cd7f2]/10">
                  <Phone size={16} className="text-[#2cd7f2]" />
                </div>
                <span className="text-sm">Available after initial enquiry</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2cd7f2]/10">
                  <Shield size={16} className="text-[#2cd7f2]" />
                </div>
                <span className="text-sm">ICAEW Regulated Practice</span>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-[#2cd7f2]/20 bg-[#edf9fd] p-6 dark:border-[#0A4858] dark:bg-[#071E24]">
              <p className="text-sm font-semibold text-[#0f2a2e] dark:text-[#2cd7f2]">Free initial consultation</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                We offer all new clients a no-obligation consultation to understand your needs before recommending any services.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-soft dark:border-[#183038] dark:bg-[#0D1E24]">
            <h2 className="mb-6 text-xl font-bold text-[#0f2a2e] dark:text-white">Send us a message</h2>
            <form className="space-y-5" action="mailto:hello@bukzaccounting.co.uk" method="post" encType="text/plain">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    First name
                  </label>
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0f2a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2a2e]/10 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-100"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Last name
                  </label>
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0f2a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2a2e]/10 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-100"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0f2a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2a2e]/10 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="organisation" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Organisation <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  id="organisation"
                  name="organisation"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0f2a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2a2e]/10 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-100"
                  placeholder="Business or charity name"
                />
              </div>

              <div>
                <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  I&apos;m interested in
                </label>
                <select
                  id="service"
                  name="service"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-colors focus:border-[#0f2a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2a2e]/10 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-100"
                >
                  <option value="">Select a service</option>
                  <option value="accounting">Accounting services</option>
                  <option value="advisory">Advisory services</option>
                  <option value="education">Financial education</option>
                  <option value="all">All services</option>
                  <option value="other">Not sure yet</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0f2a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2a2e]/10 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-100"
                  placeholder="Tell us a little about your situation and what you need help with…"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#0f2a2e] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#122e33] dark:bg-[#2cd7f2] dark:text-[#0f2a2e] dark:hover:bg-[#1bc6e2]"
              >
                Send message
              </button>

              <p className="text-center text-xs text-slate-400">
                We&apos;ll respond within one business day.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
