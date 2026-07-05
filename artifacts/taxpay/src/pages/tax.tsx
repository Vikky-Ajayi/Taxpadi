import { useState } from "react";
import { Link } from "wouter";
import { 
  useListStatements, 
  useCalculateTax, 
  useListTaxCalculations, 
  useGetDashboardSummary,
  getListTaxCalculationsQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatNaira, formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, ArrowRight, Info, Loader2, CheckCircle2 } from "lucide-react";

export default function TaxPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedStatementId, setSelectedStatementId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const { data: statements, isLoading: isLoadingStatements } = useListStatements();
  const { data: calculations, isLoading: isLoadingCalculations } = useListTaxCalculations();
  
  const calculateMutation = useCalculateTax();
  
  const handleCalculate = () => {
    if (!selectedStatementId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a bank statement to analyze.",
      });
      return;
    }

    calculateMutation.mutate(
      {
        data: {
          statementId: parseInt(selectedStatementId),
          taxYear: parseInt(selectedYear),
          includeReliefs: true
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTaxCalculationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({
            title: "Calculation Complete",
            description: "Your tax liability has been computed based on the selected statement.",
          });
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Calculation Failed",
            description: error?.message || "There was an error calculating your tax.",
          });
        }
      }
    );
  };

  const latestCalc = calculations && calculations.length > 0 ? calculations[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tax Calculation</h1>
        <p className="text-muted-foreground mt-1">Compute your liability under the Nigeria Tax Act 2025.</p>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            New Calculation
          </CardTitle>
          <CardDescription>Select a categorized statement to determine your tax obligation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Data Source (Bank Statement)</label>
              <Select value={selectedStatementId} onValueChange={setSelectedStatementId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select an uploaded statement" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingStatements ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : statements?.map((st) => (
                    <SelectItem key={st.id} value={st.id.toString()}>
                      {st.bankName} - {st.accountName} ({formatDate(st.periodFrom)} to {formatDate(st.periodTo)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[150px] space-y-2">
              <label className="text-sm font-medium">Tax Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[150px] flex items-end">
              <Button 
                onClick={handleCalculate} 
                disabled={!selectedStatementId || calculateMutation.isPending}
                className="w-full h-12"
              >
                {calculateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingCalculations ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : latestCalc ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">Latest Results: {latestCalc.taxYear}</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Gross Income</span>
                </div>
                <div className="text-2xl font-bold">{formatNaira(latestCalc.grossIncome)}</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Personal Relief</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">-{formatNaira(latestCalc.personalRelief)}</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground shadow-md">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium opacity-90">Tax Liability</span>
                </div>
                <div className="text-3xl font-bold">{formatNaira(latestCalc.taxLiability)}</div>
                <p className="text-xs opacity-80 mt-1">Effective Rate: {latestCalc.effectiveRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Tax Band Breakdown</CardTitle>
                <CardDescription>How your tax was calculated based on standard Nigerian progressive bands.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Income Band</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Taxable Amount</TableHead>
                      <TableHead className="text-right">Tax Payable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestCalc.bands.map((band, i) => (
                      <TableRow key={i} className={band.taxPayable > 0 ? "bg-primary/5 font-medium" : "text-muted-foreground"}>
                        <TableCell>{band.band}</TableCell>
                        <TableCell>{band.rate}%</TableCell>
                        <TableCell className="text-right">{formatNaira(band.taxableAmount)}</TableCell>
                        <TableCell className="text-right">{formatNaira(band.taxPayable)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/80 font-bold border-t-2">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right">{formatNaira(latestCalc.taxableIncome)}</TableCell>
                      <TableCell className="text-right">{formatNaira(latestCalc.taxLiability)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed border">
                    <h4 className="font-semibold mb-2">English</h4>
                    <p>{latestCalc.plainEnglishSummary}</p>
                  </div>
                  {latestCalc.pidginSummary && (
                    <div className="p-4 bg-primary/5 rounded-lg text-sm leading-relaxed border border-primary/10">
                      <h4 className="font-semibold mb-2 text-primary">Pidgin</h4>
                      <p>{latestCalc.pidginSummary}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 p-4">
                  <Link href="/payment" className="w-full">
                    <Button className="w-full">Proceed to Payment</Button>
                  </Link>
                  <Link href="/filing" className="w-full">
                    <Button variant="outline" className="w-full">Go to Filing Assistant</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
          <Calculator className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p className="text-lg">No tax calculations found.</p>
          <p className="text-sm mt-2">Select a statement and click calculate to generate your report.</p>
        </div>
      )}
    </div>
  );
}
