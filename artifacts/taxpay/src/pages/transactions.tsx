import { useState } from "react";
import { 
  useListStatements, 
  useListTransactions, 
  useGetTransactionSummary,
  useUpdateTransaction,
  getListTransactionsQueryKey,
  getGetTransactionSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatNaira, formatDate } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, RefreshCw, Upload, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function TransactionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatementId, setSelectedStatementId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: statements, isLoading: isLoadingStatements } = useListStatements();

  // Auto-select first statement if available and none selected
  if (statements && statements.length > 0 && selectedStatementId === null) {
    setSelectedStatementId(statements[0].id);
  }

  const { data: transactions, isLoading: isLoadingTransactions } = useListTransactions(
    { 
      statementId: selectedStatementId || undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined
    },
    { query: { enabled: !!selectedStatementId } }
  );

  const { data: summary, isLoading: isLoadingSummary } = useGetTransactionSummary(
    { statementId: selectedStatementId! },
    { query: { enabled: !!selectedStatementId } }
  );

  const updateTxMutation = useUpdateTransaction();

  const handleToggleTaxable = (txId: number, currentTaxable: boolean) => {
    updateTxMutation.mutate(
      { 
        id: txId, 
        data: { taxable: !currentTaxable } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTransactionSummaryQueryKey() });
          toast({
            title: "Transaction updated",
            description: `Marked as ${!currentTaxable ? "taxable" : "non-taxable"}.`,
          });
        }
      }
    );
  };

  const handleCategoryChange = (txId: number, newCategory: any) => {
    updateTxMutation.mutate(
      { 
        id: txId, 
        data: { category: newCategory } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTransactionSummaryQueryKey() });
          toast({
            title: "Category updated",
            description: "Transaction reclassified successfully.",
          });
        }
      }
    );
  };

  if (isLoadingStatements) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!statements || statements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Upload className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No statements uploaded</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Upload your bank statements to let TaxPay automatically categorize your transactions and calculate your tax liability.
        </p>
        <Link href="/upload">
          <Button size="lg">Upload Statement</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Review and reclassify your banking activity.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select 
            value={selectedStatementId?.toString()} 
            onValueChange={(val) => setSelectedStatementId(parseInt(val))}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select Statement" />
            </SelectTrigger>
            <SelectContent>
              {statements.map((st) => (
                <SelectItem key={st.id} value={st.id.toString()}>
                  {st.bankName} ({st.accountNumber.slice(-4)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingSummary ? (
        <Skeleton className="h-[150px] w-full rounded-xl" />
      ) : summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary text-primary-foreground border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Inflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNaira(summary.totalIncome)}</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxable Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatNaira(summary.taxableIncome)}</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Non-Taxable Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">{formatNaira(summary.nonTaxableIncome)}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Transaction Ledger</h3>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filter Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="freelance_income">Freelance</SelectItem>
              <SelectItem value="business_income">Business</SelectItem>
              <SelectItem value="transfer_in">Transfers In</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoadingTransactions ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No transactions found for these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Taxable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                    <TableCell className="font-medium truncate max-w-[300px]" title={tx.description}>
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={tx.category} 
                        onValueChange={(val) => handleCategoryChange(tx.id, val)}
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs border-dashed focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="freelance_income">Freelance</SelectItem>
                          <SelectItem value="business_income">Business</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="transfer_in">Transfer In</SelectItem>
                          <SelectItem value="bills">Bills</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={`text-right font-bold whitespace-nowrap ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch 
                          checked={tx.taxable} 
                          onCheckedChange={() => handleToggleTaxable(tx.id, tx.taxable)}
                          disabled={updateTxMutation.isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
