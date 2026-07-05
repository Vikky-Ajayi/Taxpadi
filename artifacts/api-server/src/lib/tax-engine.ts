/**
 * Nigerian Personal Income Tax Engine
 * Based on Nigeria Tax Act 2025 — DETERMINISTIC, never LLM
 * Per-income-year bands with personal relief and consolidated relief allowance
 */

export interface TaxBand {
  band: string;
  rate: number;
  taxableAmount: number;
  taxPayable: number;
}

export interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  personalRelief: number;
  taxLiability: number;
  effectiveRate: number;
  bands: TaxBand[];
}

// Nigeria Tax Act 2025 — Personal Income Tax bands
const BANDS_2025 = [
  { limit: 300_000, rate: 0.07, label: "First ₦300,000" },
  { limit: 300_000, rate: 0.11, label: "Next ₦300,000" },
  { limit: 500_000, rate: 0.15, label: "Next ₦500,000" },
  { limit: 500_000, rate: 0.19, label: "Next ₦500,000" },
  { limit: 1_600_000, rate: 0.21, label: "Next ₦1,600,000" },
  { limit: Infinity, rate: 0.24, label: "Above ₦3,200,000" },
];

// Consolidated Relief Allowance (CRA): higher of ₦200,000 or 1% of gross income + 20% of gross income
function computePersonalRelief(grossIncome: number): number {
  const onePercent = grossIncome * 0.01;
  const baseRelief = Math.max(200_000, onePercent);
  const cra = baseRelief + grossIncome * 0.20;
  // Minimum tax: 1% of gross if relief wipes out liability
  return cra;
}

export function calculateNigerianTax(grossIncome: number, includeReliefs = true): TaxResult {
  const personalRelief = includeReliefs ? computePersonalRelief(grossIncome) : 0;
  const taxableIncome = Math.max(0, grossIncome - personalRelief);

  const bands: TaxBand[] = [];
  let remaining = taxableIncome;
  let totalTax = 0;

  for (const band of BANDS_2025) {
    if (remaining <= 0) break;
    const taxableInBand = band.limit === Infinity ? remaining : Math.min(remaining, band.limit);
    const taxInBand = taxableInBand * band.rate;
    bands.push({
      band: band.label,
      rate: band.rate,
      taxableAmount: taxableInBand,
      taxPayable: taxInBand,
    });
    totalTax += taxInBand;
    remaining -= taxableInBand;
  }

  // Minimum tax: 1% of gross income if computed tax is less
  const minimumTax = grossIncome * 0.01;
  const taxLiability = Math.max(totalTax, grossIncome > 0 ? minimumTax : 0);
  const effectiveRate = grossIncome > 0 ? taxLiability / grossIncome : 0;

  return {
    grossIncome,
    taxableIncome,
    personalRelief,
    taxLiability,
    effectiveRate,
    bands,
  };
}

export function generatePlainEnglishSummary(result: TaxResult): string {
  const fmt = (n: number) => `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return [
    `Your total income for this period is ${fmt(result.grossIncome)}.`,
    `After applying your Consolidated Relief Allowance of ${fmt(result.personalRelief)}, your taxable income is ${fmt(result.taxableIncome)}.`,
    `Based on Nigeria's 2025 personal income tax bands, your total tax liability is ${fmt(result.taxLiability)}.`,
    `Your effective tax rate is ${(result.effectiveRate * 100).toFixed(2)}% of your gross income.`,
  ].join(" ");
}

export function generatePidginSummary(result: TaxResult): string {
  const fmt = (n: number) => `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return [
    `Your total money wey you earn for this period na ${fmt(result.grossIncome)}.`,
    `After we remove your relief allowance of ${fmt(result.personalRelief)}, the income wey government go tax na ${fmt(result.taxableIncome)}.`,
    `According to Nigeria 2025 tax law, the tax wey you go pay na ${fmt(result.taxLiability)}.`,
    `Na only ${(result.effectiveRate * 100).toFixed(2)}% of your total income dey go to tax — no be everything!`,
  ].join(" ");
}
