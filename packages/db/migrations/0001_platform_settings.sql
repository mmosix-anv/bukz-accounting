-- Migration: platform_settings + settings_audit_log tables

CREATE TABLE IF NOT EXISTS platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT NOT NULL,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL,
  old_value   JSONB,
  new_value   JSONB NOT NULL,
  changed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS settings_audit_log_setting_key_idx ON settings_audit_log (setting_key);
CREATE INDEX IF NOT EXISTS settings_audit_log_created_at_idx  ON settings_audit_log (created_at);

-- RLS for platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_authenticated"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "settings_select_anon"
  ON platform_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "settings_write_admin"
  ON platform_settings FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- RLS for settings_audit_log
ALTER TABLE settings_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_admin"
  ON settings_audit_log FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "audit_log_insert_admin"
  ON settings_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Seed default values (idempotent)
INSERT INTO platform_settings (key, value, description) VALUES
  ('pricing.employerSubscription.free',
   '{"id":"free","label":"Free","priceMonthlyPence":0,"listings":1,"description":"Base employer access without a paid subscription.","features":["1 active job listing","Standard search placement","Applications inbox"],"highlight":false}',
   'Free employer tier settings'),
  ('pricing.employerSubscription.starter',
   '{"id":"starter","label":"Starter","priceMonthlyPence":4900,"listings":3,"description":"Perfect for small firms making occasional hires.","features":["Up to 3 active job listings","Standard search placement","Applications inbox","Email notifications","30-day listing duration"],"highlight":false}',
   'Starter employer subscription settings'),
  ('pricing.employerSubscription.pro',
   '{"id":"pro","label":"Pro","priceMonthlyPence":9900,"listings":10,"description":"For growing firms with regular recruitment needs.","features":["Up to 10 active job listings","Priority search placement","Applications inbox","Email notifications","Featured listing badge","60-day listing duration","Candidate CV access"],"highlight":true}',
   'Pro employer subscription settings'),
  ('pricing.employerSubscription.enterprise',
   '{"id":"enterprise","label":"Enterprise","priceMonthlyPence":24900,"listings":999,"description":"Unlimited hiring for large firms and recruiters.","features":["Unlimited active listings","Top search placement","Dedicated account manager","Bulk job import (CSV)","Custom branding","API access","SLA support"],"highlight":false}',
   'Enterprise employer subscription settings'),
  ('pricing.jobPosting.single',
   '{"id":"single","label":"Single posting","pricePence":19900,"priceNote":"GBP, one-off","listingCount":1,"features":["1 job listing","30-day visibility","Candidate matching","Applicant dashboard"]}',
   'Single job posting package settings'),
  ('pricing.jobPosting.triple',
   '{"id":"triple","label":"3-Job bundle","pricePence":49900,"priceNote":"GBP, save \u00a398","listingCount":3,"badge":"Best value","features":["3 job listings","30-day each","Priority placement","Candidate matching","Applicant dashboard"]}',
   'Triple job posting package settings'),
  ('pricing.jobPosting.monthly',
   '{"id":"monthly","label":"Monthly posting","pricePence":14900,"priceNote":"GBP, billed monthly","listingCount":1,"recurringInterval":"month","features":["1 rolling job listing","Monthly billing","Candidate matching","Applicant dashboard"]}',
   'Monthly job posting package settings'),
  ('cpd.requirements',
   '{"ICAEW":40,"ACCA":40,"CIMA":20,"AAT":30,"CIPFA":30}',
   'Annual CPD hour requirements per professional body'),
  ('tax.uk.bands',
   '{"personalAllowance":12570,"basicRateBandSize":37700,"higherRateBandSize":74870,"additionalRateThreshold":112570,"basicRate":0.2,"higherRate":0.4,"additionalRate":0.45,"niPrimaryThreshold":12570,"niUpperEarningsBandSize":37700,"niLowerRate":0.08,"niUpperRate":0.02}',
   'UK income tax and National Insurance bands for tax calculator')
ON CONFLICT (key) DO NOTHING;
