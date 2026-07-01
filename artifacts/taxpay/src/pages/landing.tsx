import { Shield, Smartphone, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">TaxPay</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
                The Nigeria Tax Act 2025 Guide
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Tax, explained like you're <br className="hidden sm:inline" />
                <span className="text-primary">talking to a friend.</span>
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                The personal tax guide for 15 million Nigerians. Upload your bank statement, let AI do the math, and pay securely. As simple as sending a WhatsApp message.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-lg shadow-primary/20">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    I already have an account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How TaxPay works</h2>
              <p className="mt-4 text-lg text-muted-foreground">Three simple steps to financial clarity.</p>
            </div>
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Upload Statement</h3>
                <p className="text-muted-foreground">
                  Paste your raw bank statement CSV. We securely process your data to understand your income.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">AI Calculation</h3>
                <p className="text-muted-foreground">
                  Our system categorizes your transactions and computes your exact tax liability under the latest Nigerian tax laws.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Pay & File</h3>
                <p className="text-muted-foreground">
                  Make your payment via Nomba virtual account and get step-by-step guidance for TaxPro Max filing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ask questions in your preferred language</h2>
                <p className="text-lg text-muted-foreground">
                  Tax shouldn't require a law degree. Chat with our AI assistant in English, Pidgin, Hausa, or Igbo to understand your liabilities and reliefs.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>CBN-certified bank grade security</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <span>WhatsApp-style chat interface</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Instant tax calculation updates</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
                <div className="bg-secondary p-4 text-secondary-foreground flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">TaxPay AI</div>
                    <div className="text-xs opacity-80">Online</div>
                  </div>
                </div>
                <div className="p-6 space-y-4 bg-[#EFEAE2] dark:bg-card min-h-[300px]">
                  <div className="flex justify-end">
                    <div className="bg-[#D9FDD3] dark:bg-primary text-foreground dark:text-primary-foreground px-4 py-2 rounded-lg rounded-tr-none max-w-[80%] shadow-sm">
                      <p>How much tax do I owe this year? I'm a freelancer.</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-muted text-foreground px-4 py-2 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
                      <p>Based on your uploaded statement, your gross income is ₦4,500,000. After deducting ₦200,000 personal relief, your taxable income is ₦4,300,000. Your estimated tax liability is ₦410,000.</p>
                      <p className="text-xs text-muted-foreground mt-1">Want me to break down the calculation bands for you?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">TaxPay</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaxPay. The Nigeria Tax Act 2025 Guide.
          </p>
        </div>
      </footer>
    </div>
  );
}