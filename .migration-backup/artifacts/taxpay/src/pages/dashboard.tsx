import { Link } from "wouter";
import { formatNaira } from "@/lib/utils";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, CreditCard, FileCheck, Upload, ArrowRight, Activity, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center p-8 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
        <h2 className="text-lg font-bold">Could not load dashboard</h2>
        <p className="mt-2 opacity-80">There was an error fetching your summary. Please try again later.</p>
      </div>
    );
  }

  const getFilingStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Completed</span>;
      case 'in_progress': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">In Progress</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Not Started</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Welcome back. Here's your tax summary for the year.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload">
            <Button className="bg-primary text-primary-foreground">
              <Upload className="mr-2 h-4 w-4" />
              New Statement
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Liability</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(summary.totalTaxLiability)}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on latest calculations</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatNaira(summary.totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.pendingPayments > 0 ? (
                <span className="text-yellow-600 dark:text-yellow-400">{summary.pendingPayments} pending payments</span>
              ) : (
                "All payments cleared"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filing Status</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 flex items-center h-8">
              {getFilingStatusBadge(summary.filingStatus)}
            </div>
            <Link href="/filing" className="text-xs text-primary hover:underline inline-flex items-center">
              Go to filing assistant <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-primary shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <MessageSquare className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium opacity-90">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{summary.messagesCount}</div>
            <p className="text-xs opacity-80 mt-1">Messages exchanged</p>
            <Link href="/chat" className="mt-4 inline-flex items-center text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
              Chat with TaxPay <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest categorized banking activities.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentTransactions && summary.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {summary.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <Activity className="mx-auto h-8 w-8 opacity-20 mb-2" />
                <p>No transactions found</p>
                <Link href="/upload" className="text-primary text-sm mt-2 hover:underline inline-block">Upload a statement to get started</Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/transactions" className="w-full">
              <Button variant="outline" className="w-full text-xs">View All Transactions</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Latest Tax Calculation</CardTitle>
            <CardDescription>Breakdown of your current tax liability.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.latestCalculation ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Gross Income</span>
                  <span className="font-medium">{formatNaira(summary.latestCalculation.grossIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Personal Relief</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-{formatNaira(summary.latestCalculation.personalRelief)}</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Taxable Income</span>
                  <span className="font-medium">{formatNaira(summary.latestCalculation.taxableIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg bg-primary/5 border-primary/20">
                  <span className="text-sm font-medium">Estimated Tax Liability</span>
                  <span className="text-lg font-bold text-primary">{formatNaira(summary.latestCalculation.taxLiability)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <Calculator className="mx-auto h-8 w-8 opacity-20 mb-2" />
                <p>No tax calculations yet</p>
                <Link href="/tax" className="text-primary text-sm mt-2 hover:underline inline-block">Calculate your tax now</Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/tax" className="w-full">
              <Button variant="outline" className="w-full text-xs">View Full Details</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
