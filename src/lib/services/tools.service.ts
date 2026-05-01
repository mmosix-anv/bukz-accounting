import { db } from '@/lib/db';
import { jobListings } from '@bukz/db';
import { eq, like, and, desc } from 'drizzle-orm';
import { getUkTaxBands } from './settings.service';

export async function calculateTax(input: { annualIncome: number; pensionContribution?: number }) {
  const bands = await getUkTaxBands();
  const { annualIncome, pensionContribution = 0 } = input;
  const grossIncome = annualIncome - pensionContribution;
  const taxableIncome = Math.max(0, grossIncome - bands.personalAllowance);

  const basicRate = Math.min(taxableIncome, bands.basicRateBandSize) * bands.basicRate;
  const higherRate = Math.max(0, Math.min(taxableIncome - bands.basicRateBandSize, bands.higherRateBandSize)) * bands.higherRate;
  const additionalRate = Math.max(0, taxableIncome - bands.additionalRateThreshold) * bands.additionalRate;
  const totalTax = basicRate + higherRate + additionalRate;

  const niBase = Math.max(0, grossIncome - bands.niPrimaryThreshold);
  const niLower = Math.min(niBase, bands.niUpperEarningsBandSize) * bands.niLowerRate;
  const niUpper = Math.max(0, niBase - bands.niUpperEarningsBandSize) * bands.niUpperRate;
  const nationalInsurance = niLower + niUpper;

  return {
    grossIncome, personalAllowance: bands.personalAllowance, taxableIncome,
    basicRateTax: basicRate, higherRateTax: higherRate, additionalRateTax: additionalRate,
    totalTax, nationalInsurance,
    takeHomePay: grossIncome - totalTax - nationalInsurance,
    effectiveRate: grossIncome > 0 ? ((totalTax + nationalInsurance) / grossIncome) * 100 : 0,
  };
}

export function checkIr35(input: { answers: Record<string, boolean> }) {
  const positiveIndicators = Object.values(input.answers).filter(Boolean).length;
  const score = positiveIndicators / Object.keys(input.answers).length;
  const riskLevel: 'inside' | 'borderline' | 'outside' = score >= 0.6 ? 'inside' : score >= 0.4 ? 'borderline' : 'outside';
  return {
    riskLevel,
    score: Math.round(score * 100),
    reasoning: [`${positiveIndicators} of ${Object.keys(input.answers).length} indicators suggest inside IR35`],
    recommendations: riskLevel === 'inside'
      ? ['Consider operating through PAYE', 'Consult an IR35 specialist']
      : riskLevel === 'borderline'
        ? ['Review contract terms with a specialist', 'Ensure working practices match contract']
        : ['Document evidence of outside IR35 status', 'Review annually'],
  };
}

export async function getSalaryBenchmark(input: { title?: string; location?: string; experienceLevel?: string }) {
  const conditions: ReturnType<typeof eq>[] = [eq(jobListings.status, 'active')];
  if (input.title) conditions.push(like(jobListings.title, `%${input.title}%`));
  if (input.location) conditions.push(like(jobListings.location, `%${input.location}%`));
  if (input.experienceLevel) conditions.push(eq(jobListings.experienceLevel, input.experienceLevel as typeof jobListings.experienceLevel._.data));

  const results = await db
    .select({ salaryMin: jobListings.salaryMin, salaryMax: jobListings.salaryMax })
    .from(jobListings)
    .where(and(...conditions))
    .orderBy(desc(jobListings.createdAt))
    .limit(100);

  if (!results.length) return { percentile25: 0, median: 0, percentile75: 0, sampleSize: 0 };

  const salaries = results.map((r) => (Number(r.salaryMin) + Number(r.salaryMax)) / 2).filter((s) => !isNaN(s)).sort((a, b) => a - b);
  const p = (pct: number) => salaries[Math.floor(salaries.length * pct)] ?? 0;
  return { percentile25: p(0.25), median: p(0.5), percentile75: p(0.75), sampleSize: salaries.length };
}
