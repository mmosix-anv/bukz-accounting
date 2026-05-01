import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | BUKZ Accounting',
  description: 'Terms and conditions for using the BUKZ Accounting platform.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary mb-2">Terms of Service</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: 30 April 2026</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-primary">1. Acceptance of terms</h2>
          <p className="mt-2 text-slate-600">
            By accessing or using the BUKZ Accounting platform (&quot;Service&quot;), operated by BUKZ Accounting Ltd, a company registered in England and Wales, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">2. Description of service</h2>
          <p className="mt-2 text-slate-600">
            BUKZ provides an online platform for UK accounting and finance professionals, including job listings (BUKZ Jobs), continuing professional development courses (BUKZ Learn), editorial content and tools (BUKZ Insight), and access to verified accounting experts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">3. User accounts</h2>
          <p className="mt-2 text-slate-600">
            You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. You must be at least 18 years old to use the Service. BUKZ reserves the right to terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">4. Employer and job posting rules</h2>
          <p className="mt-2 text-slate-600">
            Employers may only post genuine vacancies for UK-based accounting and finance roles. Job listings must comply with the Equality Act 2010 and all applicable UK employment law. BUKZ reserves the right to remove any listing at its discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">5. Payments and refunds</h2>
          <p className="mt-2 text-slate-600">
            All prices are in GBP and inclusive of VAT where applicable. Course enrolments and job posting packages are non-refundable once access has been granted, except where required by the Consumer Contracts Regulations 2013. Subscription plans may be cancelled at any time; cancellation takes effect at the end of the billing period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">6. Intellectual property</h2>
          <p className="mt-2 text-slate-600">
            All content on the platform, including course materials, articles, and tools, is the property of BUKZ Accounting Ltd or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">7. Limitation of liability</h2>
          <p className="mt-2 text-slate-600">
            BUKZ Accounting Ltd is not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim. Nothing in these terms limits liability for death or personal injury caused by negligence.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">8. Governing law</h2>
          <p className="mt-2 text-slate-600">
            These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">9. Changes to terms</h2>
          <p className="mt-2 text-slate-600">
            We may update these terms from time to time. We will notify registered users of material changes by email. Continued use of the Service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary">10. Contact</h2>
          <p className="mt-2 text-slate-600">
            For questions about these terms, contact us at{' '}
            <a href="mailto:legal@bukz.co.uk" className="text-accent hover:underline">legal@bukz.co.uk</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
