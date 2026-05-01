import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BUKZ Accounting',
  description: 'How BUKZ Accounting collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: 30 April 2026</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-primary">1. Who we are</h2>
          <p className="mt-2 text-slate-600">
            BUKZ Accounting Ltd (&quot;BUKZ&quot;, &quot;we&quot;, &quot;us&quot;) is the data controller for personal data processed through the BUKZ platform. We are registered in England and Wales. Contact: <a href="mailto:privacy@bukz.co.uk" className="text-accent hover:underline">privacy@bukz.co.uk</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">2. Data we collect</h2>
          <ul className="mt-2 list-disc pl-6 text-slate-600 space-y-1">
            <li><strong>Account data:</strong> name, email address, role, and authentication credentials.</li>
            <li><strong>Profile data:</strong> professional headline, CV, qualifications, location, and skills you provide.</li>
            <li><strong>Usage data:</strong> pages visited, features used, course progress, and job applications.</li>
            <li><strong>Payment data:</strong> billing information processed securely by Stripe. We do not store card numbers.</li>
            <li><strong>Communications:</strong> messages and support enquiries you send us.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">3. How we use your data</h2>
          <ul className="mt-2 list-disc pl-6 text-slate-600 space-y-1">
            <li>Providing and improving the Service (lawful basis: contract performance).</li>
            <li>Sending transactional emails such as application confirmations (lawful basis: contract performance).</li>
            <li>Analytics to understand usage patterns (lawful basis: legitimate interests).</li>
            <li>Marketing communications with your consent (lawful basis: consent).</li>
            <li>Compliance with legal obligations (lawful basis: legal obligation).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">4. Cookies and tracking</h2>
          <p className="mt-2 text-slate-600">
            We use essential cookies for authentication and analytics cookies (PostHog) with your consent. You can manage cookie preferences via the cookie banner. See our Cookie Policy for full details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">5. Data sharing</h2>
          <p className="mt-2 text-slate-600">
            We share data with: Supabase (database and auth), Stripe (payments), AWS S3 (file storage), Resend (email delivery), Algolia (search), PostHog (analytics), and Sentry (error monitoring). All processors are bound by data processing agreements. We do not sell your personal data.
          </p>
          <p className="mt-2 text-slate-600">
            When you apply for a job, your CV and application data are shared with the relevant employer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">6. Data retention</h2>
          <p className="mt-2 text-slate-600">
            We retain account data for as long as your account is active and for 7 years after closure for legal compliance. Application data is retained for 2 years. You may request deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">7. Your rights (UK GDPR)</h2>
          <ul className="mt-2 list-disc pl-6 text-slate-600 space-y-1">
            <li>Right to access your personal data.</li>
            <li>Right to rectification of inaccurate data.</li>
            <li>Right to erasure (&quot;right to be forgotten&quot;).</li>
            <li>Right to restriction of processing.</li>
            <li>Right to data portability.</li>
            <li>Right to object to processing based on legitimate interests.</li>
            <li>Right to withdraw consent at any time.</li>
          </ul>
          <p className="mt-2 text-slate-600">
            To exercise any right, email <a href="mailto:privacy@bukz.co.uk" className="text-accent hover:underline">privacy@bukz.co.uk</a>. You may also lodge a complaint with the ICO at <a href="https://ico.org.uk" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">8. International transfers</h2>
          <p className="mt-2 text-slate-600">
            Some of our service providers process data outside the UK/EEA. We ensure adequate safeguards are in place, including UK adequacy decisions and Standard Contractual Clauses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">9. Changes to this policy</h2>
          <p className="mt-2 text-slate-600">
            We will notify you of material changes by email or in-app notice. Continued use of the Service after changes constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}
