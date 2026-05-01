import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { jobListings } from '@bukz/db';
import { eq, like, and, desc } from 'drizzle-orm';

interface TaxCalcInput {
  annualIncome: number;
  pensionContribution?: number;
}

interface Ir35Input {
  answers: Record<string, boolean>;
}

interface SalaryBenchmarkInput {
  title?: string;
  location?: string;
  experienceLevel?: string;
}

@Injectable()
export class ToolsService {
  constructor(private readonly drizzle: DrizzleService) {}

  calculateTax(input: TaxCalcInput) {
    const { annualIncome, pensionContribution = 0 } = input;
    const personalAllowance = 12570;
    const grossIncome = annualIncome - pensionContribution;
    const taxableIncome = Math.max(0, grossIncome - personalAllowance);

    const basicRate = Math.min(taxableIncome, 37700) * 0.2;
    const higherRate = Math.max(0, Math.min(taxableIncome - 37700, 74870)) * 0.4;
    const additionalRate = Math.max(0, taxableIncome - 112570) * 0.45;
    const totalTax = basicRate + higherRate + additionalRate;

    const niBase = Math.max(0, grossIncome - 12570);
    const niLower = Math.min(niBase, 37700) * 0.08;
    const niUpper = Math.max(0, niBase - 37700) * 0.02;
    const nationalInsurance = niLower + niUpper;

    return {
      grossIncome,
      personalAllowance,
      taxableIncome,
      basicRateTax: basicRate,
      higherRateTax: higherRate,
      additionalRateTax: additionalRate,
      totalTax,
      nationalInsurance,
      takeHomePay: grossIncome - totalTax - nationalInsurance,
      effectiveRate: grossIncome > 0 ? ((totalTax + nationalInsurance) / grossIncome) * 100 : 0,
    };
  }

  checkIr35(input: Ir35Input) {
    const positiveIndicators = Object.values(input.answers).filter(Boolean).length;
    const score = positiveIndicators / Object.keys(input.answers).length;

    let riskLevel: 'inside' | 'borderline' | 'outside';
    if (score >= 0.6) riskLevel = 'inside';
    else if (score >= 0.4) riskLevel = 'borderline';
    else riskLevel = 'outside';

    return {
      riskLevel,
      score: Math.round(score * 100),
      reasoning: [`${positiveIndicators} of ${Object.keys(input.answers).length} indicators suggest inside IR35`],
      recommendations:
        riskLevel === 'inside'
          ? ['Consider operating through PAYE', 'Consult an IR35 specialist']
          : riskLevel === 'borderline'
            ? ['Review contract terms with a specialist', 'Ensure working practices match contract']
            : ['Document evidence of outside IR35 status', 'Review annually'],
    };
  }

  async getSalaryBenchmark(input: SalaryBenchmarkInput) {
    const conditions = [eq(jobListings.status, 'active')];

    if (input.title) {
      conditions.push(like(jobListings.title, `%${input.title}%`));
    }
    if (input.location) {
      conditions.push(like(jobListings.location, `%${input.location}%`));
    }
    if (input.experienceLevel) {
      conditions.push(eq(jobListings.experienceLevel, input.experienceLevel as typeof jobListings.experienceLevel._.data));
    }

    const results = await this.drizzle.db
      .select({ salaryMin: jobListings.salaryMin, salaryMax: jobListings.salaryMax })
      .from(jobListings)
      .where(and(...conditions))
      .orderBy(desc(jobListings.createdAt))
      .limit(100);

    if (results.length === 0) {
      return { percentile25: 0, median: 0, percentile75: 0, sampleSize: 0 };
    }

    const salaries = results
      .map((r) => (Number(r.salaryMin) + Number(r.salaryMax)) / 2)
      .filter((s) => !isNaN(s))
      .sort((a, b) => a - b);

    const percentile25 = salaries[Math.floor(salaries.length * 0.25)];
    const median = salaries[Math.floor(salaries.length * 0.5)];
    const percentile75 = salaries[Math.floor(salaries.length * 0.75)];

    return { percentile25, median, percentile75, sampleSize: salaries.length };
  }
}
