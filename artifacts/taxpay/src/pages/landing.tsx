import { useState } from "react";
import { Link } from "wouter";
import { Star, ChevronDown, ChevronUp, Shield, MessageSquare, Zap, FileText, CreditCard, CheckCircle } from "lucide-react";

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
          <ChevronUp className="shrink-0 mt-0.5 text-gray-500" size={18} />
        ) : (
          <ChevronDown className="shrink-0 mt-0.5 text-gray-500" size={18} />
        )}
      </button>
      {open && (
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">{a}</p>
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
                Get Free Consultation
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
                <div className="flex text-[#34C77A]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-sm text-gray-500">Based on verified customer feedback</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-[#0d0d0d]">
                File Your Tax,<br />
                <span className="text-[#34C77A]">From Anywhere</span><br />
                in Nigeria
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Salaried employees, freelancers, and business owners — with a dedicated AI that handles your income analysis, tax calculation, and FIRS filing end to end.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/register">
                  <button className="bg-[#34C77A] hover:bg-[#2ab56a] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-green-900/20">
                    Get Free Consultation
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 pt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#34C77A]" /> AI tax advisory service</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#34C77A]" /> Free consultation — no obligation</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#34C77A]" /> WhatsApp-first support</span>
              </div>
            </div>

            {/* Eligibility card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#0d0d0d]">Check Your Tax Liability</h2>
                <p className="text-sm text-gray-500 mt-1">Answer 3 quick questions. Takes 30 seconds.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">What is your employment type?</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#34C77A]/40 bg-white">
                    <option>Salaried employee</option>
                    <option>Freelancer / Self-employed</option>
                    <option>Business owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">What is your approximate annual income?</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#34C77A]/40 bg-white">
                    <option>Below ₦800,000</option>
                    <option>₦800,000 – ₦3,000,000</option>
                    <option>₦3,000,000 – ₦10,000,000</option>
                    <option>Above ₦10,000,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Do you have a TIN?</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#34C77A]/40 bg-white">
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
              <p className="text-center text-xs text-gray-400">No commitment. A dedicated advisor will explain what's possible for your tax situation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-gray-100 bg-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-extrabold text-[#0d0d0d]">₦800k</div>
              <div className="text-sm text-gray-500 mt-1">Personal relief under NTA 2025 — every taxpayer gets this</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#0d0d0d]">0–24%</div>
              <div className="text-sm text-gray-500 mt-1">Tax rate bands — we find the right band for your income</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#0d0d0d]">30 sec</div>
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
            <span className="text-xs font-bold tracking-widest text-[#34C77A] uppercase">What you can do</span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0d0d0d]">
              Three paths into tax compliance<br className="hidden lg:block" /> — all managed for you
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 bg-gradient-to-br from-[#1a6e45] via-[#34C77A] to-[#6ee8a8] flex items-center justify-center">
                <FileText size={48} className="text-white/80" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-bold text-[#0d0d0d] text-lg mb-2">Salaried</h3>
                <p className="text-sm text-gray-500 leading-relaxed">For PAYE employees. Confirm your employer deductions are correct and reclaim overpaid tax automatically.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">PAYE</span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">Pension</span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">Annual relief</span>
                </div>
                <Link href="/register" className="mt-4 block text-sm font-semibold text-[#34C77A] hover:underline">Get started →</Link>
              </div>
            </div>
            {/* Card 2 */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 bg-gradient-to-br from-[#0e4d6e] via-[#1a7fa8] to-[#4ab8d9] flex items-center justify-center">
                <MessageSquare size={48} className="text-white/80" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-bold text-[#0d0d0d] text-lg mb-2">Freelancer</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Multiple clients, irregular income? Upload your bank statement and let TaxPay aggregate and classify every transaction.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">Self-assessment</span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">Multi-stream</span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">AI classifier</span>
                </div>
                <Link href="/register" className="mt-4 block text-sm font-semibold text-[#34C77A] hover:underline">Get started →</Link>
              </div>
            </div>
            {/* Card 3 */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 bg-gradient-to-br from-[#6b2fa0] via-[#9b51e0] to-[#c18cf0] flex items-center justify-center">
                <CreditCard size={48} className="text-white/80" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-bold text-[#0d0d0d] text-lg mb-2">Filing & Payment</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Pay your exact tax amount via a dedicated Nomba virtual account, then file on TaxPro Max with AI-guided step completion.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">Nomba VA</span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">TaxPro Max</span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">FIRS receipt</span>
                </div>
                <Link href="/register" className="mt-4 block text-sm font-semibold text-[#34C77A] hover:underline">Get started →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROCESS ── */}
      <section id="how-it-works" className="py-24 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-[#34C77A] uppercase">The process</span>
            <h2 className="mt-3 text-4xl font-extrabold text-white">
              Your advisor handles everything.<br className="hidden lg:block" /> You just decide.
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                n: "1",
                title: "Upload Statement",
                desc: "Paste or upload your bank statement CSV. Our classifier reads every transaction and identifies income vs expenses in seconds.",
                icon: <FileText size={22} className="text-[#34C77A]" />,
              },
              {
                n: "2",
                title: "We Analyse & Calculate",
                desc: "Including income, pension deductions, reliefs, and NTA 2025 tax bands. We produce a complete breakdown — what you owe and why.",
                icon: <Shield size={22} className="text-[#34C77A]" />,
              },
              {
                n: "3",
                title: "Pay & File on TaxPro Max",
                desc: "Transfer to your unique Nomba virtual account, then follow our AI wizard to file on TaxPro Max. Done.",
                icon: <CreditCard size={22} className="text-[#34C77A]" />,
              },
            ].map((step) => (
              <div key={step.n} className="bg-[#1a1a1a] rounded-2xl p-7 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-extrabold text-white/10">{step.n}</span>
                  <div className="bg-[#34C77A]/10 p-2 rounded-lg">{step.icon}</div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-[#34C77A] uppercase">What our users say</span>
            <h2 className="mt-3 text-4xl font-extrabold text-white">
              Nigerians filing their taxes<br className="hidden lg:block" /> — without the stress
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                quote: "I was nervous about filing as a freelancer. TaxPay showed me exactly how much I owed and generated my virtual account on the spot. The whole process took under an hour.",
                name: "Chukwuemeka A.",
                role: "Freelance designer, Lagos",
                stars: 5,
              },
              {
                quote: "I wanted to invest my dollars smarter. TaxPay found ₦180,000 in missed reliefs on my salary — money I didn't know I was leaving on the table.",
                name: "Adaeze N.",
                role: "Software Engineer, Abuja",
                stars: 5,
              },
              {
                quote: "My daughter is studying in Leeds. I file taxes in both countries. TaxPay handled the Nigerian side completely — it was the best financial decision we've made.",
                name: "Biodun O.",
                role: "Business owner, Port Harcourt",
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex text-[#34C77A] mb-4">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-bold tracking-widest text-[#34C77A] uppercase">Common questions</span>
            <h2 className="mt-3 text-4xl font-extrabold text-[#0d0d0d]">
              Everything Nigerians<br className="hidden lg:block" /> ask us about tax
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-x-16">
            <div>
              {FAQ_ITEMS.slice(0, 3).map((item, i) => (
                <FaqItem key={i} {...item} />
              ))}
            </div>
            <div>
              {FAQ_ITEMS.slice(3).map((item, i) => (
                <FaqItem key={i} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 bg-gradient-to-br from-[#0d1f14] via-[#0d2b1a] to-[#0d1222]">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Your tax compliance starts<br className="hidden lg:block" /> with one free call.
          </h2>
          <p className="text-gray-400 text-lg">
            No commitment. A dedicated advisor will explain what's possible for your tax situation.
          </p>
          <Link href="/register">
            <button className="bg-[#34C77A] hover:bg-[#2ab56a] text-white font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-lg shadow-green-900/30 mt-2">
              Get Free Consultation
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0a0a] py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#34C77A] text-white p-1.5 rounded-lg">
              <Zap className="h-4 w-4" />
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
