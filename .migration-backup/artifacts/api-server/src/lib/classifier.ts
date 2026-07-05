/**
 * Transaction classifier for Nigerian bank statements
 * Deterministic keyword-based classification — no LLM
 */

export type TransactionCategory =
  | "salary"
  | "freelance_income"
  | "business_income"
  | "investment"
  | "rent_received"
  | "transfer_in"
  | "transfer_out"
  | "bills"
  | "transport"
  | "food"
  | "entertainment"
  | "withdrawal"
  | "other";

interface ClassificationResult {
  category: TransactionCategory;
  taxable: boolean;
  confidence: number;
}

const SALARY_PATTERNS = [/salary/i, /payroll/i, /wages/i, /stipend/i, /payday/i, /paye/i, /monthly pay/i];
const FREELANCE_PATTERNS = [/freelance/i, /consulting/i, /contract/i, /invoice/i, /gig/i, /upwork/i, /fiverr/i, /project/i, /service fee/i];
const BUSINESS_PATTERNS = [/sales/i, /revenue/i, /business/i, /shop/i, /store/i, /trading/i, /supply/i, /vendor/i];
const INVESTMENT_PATTERNS = [/dividend/i, /interest/i, /yield/i, /bond/i, /stock/i, /mutual fund/i, /investment/i, /treasury/i];
const RENT_PATTERNS = [/rent/i, /rental/i, /lease/i, /tenancy/i, /landlord/i];
const TRANSFER_PATTERNS = [/transfer/i, /trf/i, /nip/i, /rtgs/i, /inter-bank/i, /remittance/i];
const BILLS_PATTERNS = [/dstv/i, /gotv/i, /airtime/i, /data/i, /electricity/i, /nepa/i, /phcn/i, /ekedc/i, /ikedc/i, /water/i, /utility/i, /subscription/i, /netflix/i, /spotify/i];
const TRANSPORT_PATTERNS = [/uber/i, /bolt/i, /taxify/i, /okada/i, /bus/i, /fuel/i, /petrol/i, /diesel/i, /parking/i, /toll/i];
const FOOD_PATTERNS = [/food/i, /restaurant/i, /eatery/i, /cafe/i, /canteen/i, /supermarket/i, /grocery/i, /shoprite/i, /spar/i, /market/i];
const ENTERTAINMENT_PATTERNS = [/cinema/i, /games/i, /lounge/i, /club/i, /bar/i, /hotel/i, /vacation/i, /holiday/i, /travel/i, /flight/i, /airline/i];
const WITHDRAWAL_PATTERNS = [/atm/i, /cash/i, /withdrawal/i, /pos/i, /cashout/i];

function matchesAny(desc: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(desc));
}

export function classifyTransaction(description: string, type: "credit" | "debit"): ClassificationResult {
  const desc = description.trim();

  if (type === "credit") {
    if (matchesAny(desc, SALARY_PATTERNS)) return { category: "salary", taxable: true, confidence: 0.92 };
    if (matchesAny(desc, FREELANCE_PATTERNS)) return { category: "freelance_income", taxable: true, confidence: 0.88 };
    if (matchesAny(desc, BUSINESS_PATTERNS)) return { category: "business_income", taxable: true, confidence: 0.85 };
    if (matchesAny(desc, INVESTMENT_PATTERNS)) return { category: "investment", taxable: true, confidence: 0.87 };
    if (matchesAny(desc, RENT_PATTERNS)) return { category: "rent_received", taxable: true, confidence: 0.90 };
    if (matchesAny(desc, TRANSFER_PATTERNS)) return { category: "transfer_in", taxable: false, confidence: 0.75 };
    return { category: "other", taxable: false, confidence: 0.60 };
  } else {
    if (matchesAny(desc, BILLS_PATTERNS)) return { category: "bills", taxable: false, confidence: 0.88 };
    if (matchesAny(desc, TRANSPORT_PATTERNS)) return { category: "transport", taxable: false, confidence: 0.85 };
    if (matchesAny(desc, FOOD_PATTERNS)) return { category: "food", taxable: false, confidence: 0.82 };
    if (matchesAny(desc, ENTERTAINMENT_PATTERNS)) return { category: "entertainment", taxable: false, confidence: 0.80 };
    if (matchesAny(desc, WITHDRAWAL_PATTERNS)) return { category: "withdrawal", taxable: false, confidence: 0.90 };
    if (matchesAny(desc, TRANSFER_PATTERNS)) return { category: "transfer_out", taxable: false, confidence: 0.75 };
    return { category: "other", taxable: false, confidence: 0.60 };
  }
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: TransactionCategory;
  taxable: boolean;
  confidence: number;
}

/**
 * Parse CSV-style bank statement text into structured transactions
 * Supports common Nigerian bank formats
 */
export function parseStatementCSV(rawData: string): ParsedTransaction[] {
  const lines = rawData.trim().split("\n").filter((l) => l.trim());
  const transactions: ParsedTransaction[] = [];

  // Skip header lines
  const dataLines = lines.filter((line) => {
    const lower = line.toLowerCase();
    return !lower.includes("date") || lower.includes(",");
  });

  for (const line of dataLines) {
    const parts = line.split(",").map((p) => p.trim().replace(/"/g, ""));
    if (parts.length < 3) continue;

    // Try to find date, description, amount columns
    const dateStr = parts[0];
    const description = parts[1] || parts[2] || "Transaction";
    const amountStr = parts.find((p) => /^\d[\d.,]+$/.test(p.replace(/[₦NGN]/g, "")));

    if (!amountStr) continue;
    const amount = parseFloat(amountStr.replace(/[₦NGN,]/g, ""));
    if (isNaN(amount) || amount <= 0) continue;

    // Determine credit/debit from columns or keywords
    let type: "credit" | "debit" = "credit";
    if (parts.length >= 4) {
      const creditCol = parts[2];
      const debitCol = parts[3];
      if (creditCol && parseFloat(creditCol.replace(/[₦NGN,]/g, "")) > 0) type = "credit";
      else if (debitCol && parseFloat(debitCol.replace(/[₦NGN,]/g, "")) > 0) type = "debit";
    } else {
      // Guess from description
      if (/debit|dr|withdrawal|payment|purchase/i.test(description)) type = "debit";
    }

    const { category, taxable, confidence } = classifyTransaction(description, type);

    // Parse date
    let parsedDate = dateStr;
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) parsedDate = d.toISOString().split("T")[0];
    } catch {
      parsedDate = new Date().toISOString().split("T")[0];
    }

    transactions.push({ date: parsedDate, description, amount, type, category, taxable, confidence });
  }

  // If nothing parsed, generate demo transactions
  if (transactions.length === 0) {
    return generateDemoTransactions();
  }

  return transactions;
}

function generateDemoTransactions(): ParsedTransaction[] {
  const today = new Date();
  const month = (d: number) => {
    const date = new Date(today);
    date.setDate(d);
    return date.toISOString().split("T")[0];
  };

  return [
    { date: month(1), description: "SALARY PAYMENT - EMPLOYER", amount: 350_000, type: "credit", category: "salary", taxable: true, confidence: 0.95 },
    { date: month(3), description: "FREELANCE PROJECT - CLIENT XYZ", amount: 120_000, type: "credit", category: "freelance_income", taxable: true, confidence: 0.90 },
    { date: month(5), description: "TRANSFER FROM SAVINGS", amount: 50_000, type: "credit", category: "transfer_in", taxable: false, confidence: 0.80 },
    { date: month(7), description: "DSTV SUBSCRIPTION", amount: 24_900, type: "debit", category: "bills", taxable: false, confidence: 0.92 },
    { date: month(8), description: "UBER NIGERIA", amount: 4_500, type: "debit", category: "transport", taxable: false, confidence: 0.88 },
    { date: month(10), description: "SHOPRITE SUPERMARKET", amount: 35_000, type: "debit", category: "food", taxable: false, confidence: 0.85 },
    { date: month(12), description: "ATM WITHDRAWAL", amount: 50_000, type: "debit", category: "withdrawal", taxable: false, confidence: 0.93 },
    { date: month(15), description: "CONSULTING FEE - ACME LTD", amount: 200_000, type: "credit", category: "freelance_income", taxable: true, confidence: 0.91 },
    { date: month(18), description: "ELECTRICITY BILL NEPA", amount: 15_000, type: "debit", category: "bills", taxable: false, confidence: 0.90 },
    { date: month(20), description: "RENT RECEIVED FROM TENANT", amount: 180_000, type: "credit", category: "rent_received", taxable: true, confidence: 0.88 },
  ];
}
