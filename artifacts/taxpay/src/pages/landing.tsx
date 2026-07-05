import { useState } from "react";
import { Link } from "wouter";
import { Star, ChevronDown, ChevronUp, Shield, MessageSquare, Zap, FileText, CreditCard, CheckCircle, Calculator } from "lucide-react";

const GREEN = "#34C77A";
const BLUE = "#1a8fbe";
const PURPLE = "#8b5cf6";

const FAQ_ITEMS = [
  {
    q: "Can Nigerians file taxes without a TIN?",
    a: "No — you need a Tax Identification Number (TIN) to file with FIRS. TaxPay walks you through getting one free via TaxPro Max in under 10 minutes.",
  },
  {
    q: "Which taxes does TaxPay calculate?",
    a: "TaxPay computes Personal Income Tax (PIT) under the Nigeria Tax Act 2025 for salaried employees and freelancers/self-employed individuals, including PAYE, pension deductions, and all applicable reliefs.",
  },
  {
    q: "Is my bank statement data secure?",
    a: "Yes. Your data is encrypted in transit and at rest. We never share your financial data with third parties. Statement data is used solely for tax computation.",
  },
  {
    q: "How do I transfer money to pay my tax?",
    a: "We generate a dedicated Nomba virtual account number for your tax payment. Transfer your exact tax amount to that account and FIRS confirmation is automatic.",
  },
  {
    q: "What if I'm a freelancer with multiple income sources?",
    a: "TaxPay handles multiple income streams. Upload statements from each source and our classifier aggregates total income before running the NTA 2025 calculation.",
  },
  {
    q: "How quickly is the tax report ready?",
    a: "Instantly. Once you upload your bank statement, classification and tax calculation complete in seconds.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-5">
      <button
        className="flex w-full items-start justify-between text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-[#0d0d0d] text-[15px] leading-snug">{q}</span>
        {open ? (
          <ChevronUp className="shrink-0 mt-0.5 text-gray-400" size={18} />
        ) : (
          <ChevronDown className="shrink-0 mt-0.5 text-gray-400" size={18} />
        )}
      </button>
      {open && (
        <p className="mt-3 text-gray-500 text-sm leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0d0d0d] font-sans">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-black">
        <div className="max-w-6xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#34C77A] text-white p-1.5 rounded-lg">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">TaxPay</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-gray-400 text-sm hover:text-white transition-colors hidden sm:block">How it Works</a>
            <a href="#faq" className="text-gray-400 text-sm hover:text-white transition-colors hidden sm:block">FAQ</a>
            <Link href="/login" className="text-gray-400 text-sm hover:text-white transition-colors">Log in</Link>
            <Link href="/register">
              <button className="bg-[#34C77A] hover:bg-[#2ab56a] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                Get Started
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-white pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex" style={{ color: GREEN }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-sm text-gray-500">Excellent · Based on verified customer feedback</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-[#0d0d0d]">
                File Your Tax,<br />
                <span style={{ color: GREEN }}>From Anywhere</span><br />
                in Nigeria
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                Salaried employees, freelancers, and business owners — with a dedicated AI that handles income analysis, tax calculation, and FIRS filing end to end.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/register">
                  <button className="bg-[#34C77A] hover:bg-[#2ab56a] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-green-900/20">
                    Get Free Consultation
                  </button>
                </Link>
                <Link href="/login">
                  <button className="bg-black hover:bg-[#1a1a1a] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors">
                    Log in
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 pt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle size={14} style={{ color: GREEN }} /> AI tax advisory</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} style={{ color: BLUE }} /> Free consultation</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} style={{ color: PURPLE }} /> WhatsApp support</span>
              </div>
            </div>

            {/* Eligibility card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#0d0d0d]">Check Your Tax Liability</h2>
                <p className="text-sm text-gray-400 mt-1">Answer 3 quick questions. Takes 30 seconds.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Employment type</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 bg-white" style={{ focusRingColor: GREEN }}>
                    <option>Salaried employee</option>
                    <option>Freelancer / Self-employed</option>
                    <option>Business owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Approximate annual income</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 bg-white">
                    <option>Below ₦800,000</option>
                    <option>₦800,000 – ₦3,000,000</option>
                    <option>₦3,000,000 – ₦10,000,000</option>
                    <option>Above ₦10,000,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Do you have a TIN?</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 bg-white">
                    <option>Yes</option>
                    <option>No, but I want one</option>
                    <option>Not sure</option>
                  </select>
                </div>
              </div>
              <Link href="/register" className="block">
                <button className="w-full bg-[#34C77A] hover:bg-[#2ab56a] text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                  Get Free Consultation →
                </button>
              </Link>
              <p className="text-center text-xs text-gray-400">No commitment. A dedicated advisor will explain what's possible for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-gray-100 bg-[#fafafa] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-extrabold" style={{ color: GREEN }}>₦800k</div>
              <div className="text-sm text-gray-500 mt-1">Personal relief under NTA 2025 — every taxpayer qualifies</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#0d0d0d]">0–24%</div>
              <div className="text-sm text-gray-500 mt-1">Tax rate bands — we find the right band for your income</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold" style={{ color: BLUE }}>30 sec</div>
              <div className="text-sm text-gray-500 mt-1">Time to get your estimated tax liability with TaxPay</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#0d0d0d]">No cap</div>
              <div className="text-sm text-gray-500 mt-1">Foreign income & multiple streams — we handle all of it</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU CAN DO ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: GREEN }}>What you can do</span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0d0d0d]">
              Three paths into tax compliance<br className="hidden lg:block" /> — all managed for you
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Card 1 — Green */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #1a6e45, ${GREEN}, #6ee8a8)` }}>
                <FileText size={48} className="text-white/80" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-bold text-[#0d0d0d] text-lg mb-2">Salaried</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Confirm your employer PAYE deductions are correct and reclaim overpaid tax automatically.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#f0fdf6", color: GREEN }}>PAYE</span>
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#f0fdf6", color: GREEN }}>Pension</span>
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#f0fdf6", color: GREEN }}>Annual relief</span>
                </div>
                <Link href="/register" className="mt-4 block text-sm font-semibold hover:underline" style={{ color: GREEN }}>Get started →</Link>
              </div>
            </div>

            {/* Card 2 — Blue */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #0e4d6e, ${BLUE}, #4ab8d9)` }}>
                <MessageSquare size={48} className="text-white/80" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-bold text-[#0d0d0d] text-lg mb-2">Freelancer</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Multiple clients, irregular income? Upload your bank statement and let TaxPay aggregate every transaction.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#eff8fd", color: BLUE }}>Self-assessment</span>
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#eff8fd", color: BLUE }}>Multi-stream</span>
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#eff8fd", color: BLUE }}>AI classifier</span>
                </div>
                <Link href="/register" className="mt-4 block text-sm font-semibold hover:underline" style={{ color: BLUE }}>Get started →</Link>
              </div>
            </div>

            {/* Card 3 — Purple */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #5b21b6, ${PURPLE}, #c4b5fd)` }}>
                <CreditCard size={48} className="text-white/80" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-bold text-[#0d0d0d] text-lg mb-2">Filing & Payment</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Pay your exact tax amount via Nomba virtual account, then file on TaxPro Max with AI-guided steps.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#f5f3ff", color: PURPLE }}>Nomba VA</span>
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#f5f3ff", color: PURPLE }}>TaxPro Max</span>
                  <span className="text-xs rounded px-2 py-1" style={{ background: "#f5f3ff", color: PURPLE }}>FIRS receipt</span>
                </div>
                <Link href="/register" className="mt-4 block text-sm font-semibold hover:underline" style={{ color: PURPLE }}>Get started →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROCESS ── */}
      <section id="how-it-works" className="py-24 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: GREEN }}>The process</span>
            <h2 className="mt-3 text-4xl font-extrabold text-white">
              Your advisor handles everything.<br className="hidden lg:block" /> You just decide.
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                n: "1", color: GREEN, bg: "#0f2e1e",
                title: "Upload Statement",
                desc: "Paste or upload your bank statement CSV. Our classifier reads every transaction and identifies income vs expenses in seconds.",
                icon: <FileText size={22} style={{ color: GREEN }} />,
              },
              {
                n: "2", color: BLUE, bg: "#0e2030",
                title: "We Analyse & Calculate",
                desc: "Including income, pension deductions, reliefs, and NTA 2025 tax bands. A complete breakdown — what you owe and why.",
                icon: <Calculator size={22} style={{ color: BLUE }} />,
              },
              {
                n: "3", color: PURPLE, bg: "#1e1030",
                title: "Pay & File on TaxPro Max",
                desc: "Transfer to your unique Nomba virtual account, then follow our AI wizard to file on TaxPro Max. Done.",
                icon: <CreditCard size={22} style={{ color: PURPLE }} />,
              },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl p-7 border border-white/5" style={{ background: step.bg }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-extrabold text-white/10">{step.n}</span>
                  <div className="p-2 rounded-lg" style={{ background: `${step.color}15` }}>{step.icon}</div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE ANALYSE ── */}
      <section className="py-24 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: BLUE }}>What we analyse</span>
            <h2 className="mt-3 text-4xl font-extrabold text-white">
              Six intelligence layers<br className="hidden lg:block" /> in every statement
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "Income Intelligence", desc: "Salary, freelance fees, dividends, rental income", color: GREEN },
              { label: "Pension Analysis", desc: "Employer & employee contributions at NTA 2025 rates", color: BLUE },
              { label: "Relief Detection", desc: "Personal relief, dependent children, life assurance", color: PURPLE },
              { label: "Band Calculation", desc: "Accurate PAYE bracket mapping — 0% to 24%", color: GREEN },
              { label: "Deduction Mapping", desc: "Business expenses, professional subscriptions", color: BLUE },
              { label: "Liability Forecasting", desc: "Quarterly projections and filing deadlines", color: PURPLE },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-5 border border-white/5 bg-white/3">
                <div className="w-2 h-2 rounded-full mb-3" style={{ background: item.color }} />
                <h4 className="text-white font-semibold text-sm mb-1">{item.label}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: GREEN }}>What our users say</span>
            <h2 className="mt-3 text-4xl font-extrabold text-white">
              Nigerians filing their taxes<br className="hidden lg:block" /> — without the stress
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                quote: "I was nervous about filing as a freelancer. TaxPay showed me exactly how much I owed and generated my virtual account on the spot. Done in under an hour.",
                name: "Chukwuemeka A.", role: "Freelance designer, Lagos", color: GREEN,
              },
              {
                quote: "TaxPay found ₦180,000 in missed reliefs on my salary. Money I didn't know I was leaving on the table.",
                name: "Adaeze N.", role: "Software Engineer, Abuja", color: BLUE,
              },
              {
                quote: "TaxPay handled the Nigerian side completely — it was the best financial decision our family made this year.",
                name: "Biodun O.", role: "Business owner, Port Harcourt", color: PURPLE,
              },
            ].map((t, i) => (
              <div key={i} className="bg-white/4 border border-white/8 rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex mb-4" style={{ color: t.color }}>
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/8">
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: PURPLE }}>Start with a free assessment</span>
            <h2 className="mt-3 text-4xl font-extrabold text-white">Simple pricing. No surprises.</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                plan: "Free", price: "₦0", desc: "Free Tax Assessment",
                features: ["One bank statement upload", "Full tax calculation", "AI chat (10 messages)", "Tax summary report"],
                cta: "Start Free", color: GREEN, ctaBg: "bg-white text-[#0d0d0d]",
              },
              {
                plan: "Pro", price: "₦4,999", desc: "per tax year",
                features: ["Unlimited uploads", "Full AI tax chat", "Nomba payment account", "TaxPro Max filing wizard", "Priority support"],
                cta: "Get Pro", color: BLUE, ctaBg: "text-white", ctaStyle: { background: BLUE },
                highlight: true,
              },
              {
                plan: "Business", price: "Custom", desc: "Custom Pricing",
                features: ["Multiple employees/directors", "Payroll PAYE management", "Dedicated tax advisor", "API access"],
                cta: "Contact Us", color: PURPLE, ctaBg: "bg-white/10 text-white",
              },
            ].map((plan) => (
              <div
                key={plan.plan}
                className={`rounded-2xl p-7 border flex flex-col justify-between ${plan.highlight ? "border-[#1a8fbe]/50 bg-[#0e2030]" : "border-white/8 bg-white/4"}`}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: plan.color }}>{plan.plan}</div>
                  <div className="text-4xl font-extrabold text-white mb-1">{plan.price}</div>
                  <div className="text-gray-500 text-sm mb-6">{plan.desc}</div>
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle size={14} style={{ color: plan.color }} className="shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/register" className="block">
                  <button
                    className={`w-full font-bold py-3 rounded-xl text-sm transition-colors ${plan.ctaBg}`}
                    style={plan.ctaStyle}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: GREEN }}>Common questions</span>
            <h2 className="mt-3 text-4xl font-extrabold text-[#0d0d0d]">
              Everything Nigerians<br className="hidden lg:block" /> ask us about tax
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-x-16">
            <div>{FAQ_ITEMS.slice(0, 3).map((item, i) => <FaqItem key={i} {...item} />)}</div>
            <div>{FAQ_ITEMS.slice(3).map((item, i) => <FaqItem key={i} {...item} />)}</div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Your tax compliance starts<br className="hidden lg:block" /> with one free call.
          </h2>
          <p className="text-gray-400 text-lg">No commitment. A dedicated advisor will explain what's possible for your situation.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/register">
              <button className="bg-[#34C77A] hover:bg-[#2ab56a] text-white font-bold px-10 py-4 rounded-xl text-base transition-colors">
                Get Free Consultation
              </button>
            </Link>
            <Link href="/login">
              <button className="bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-4 rounded-xl text-base transition-colors">
                Log in
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: GREEN }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">TaxPay</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-300 transition-colors">How it Works</a>
            <a href="#faq" className="hover:text-gray-300 transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-gray-300 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-gray-300 transition-colors">Sign up</Link>
          </nav>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} TaxPay. Nigeria Tax Act 2025.</p>
        </div>
      </footer>
    </div>
  );
}
