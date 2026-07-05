import { useState } from "react";
import { 
  useListTaxCalculations, 
  useCreatePayment, 
  useConfirmPayment,
  useListPayments,
  getListPaymentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatNaira, formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, CheckCircle2, Copy, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

export default function PaymentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: calculations, isLoading: isLoadingCalculations } = useListTaxCalculations();
  const { data: payments, isLoading: isLoadingPayments } = useListPayments();
  
  const createPaymentMutation = useCreatePayment();
  const confirmPaymentMutation = useConfirmPayment();

  const handleGenerateAccount = (calcId: number) => {
    createPaymentMutation.mutate(
      { data: { taxCalculationId: calcId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          toast({
            title: "Virtual Account Generated",
            description: "You can now make a transfer to the Nomba account.",
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message || "Could not generate virtual account",
          });
        }
      }
    );
  };

  const handleConfirmPayment = (paymentId: number) => {
    confirmPaymentMutation.mutate(
      { id: paymentId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          toast({
            title: "Payment Confirmed",
            description: "Your tax payment has been successfully recorded.",
          });
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Account number copied to clipboard",
    });
  };

  if (isLoadingCalculations || isLoadingPayments) {
    return <Skeleton className="h-[400px] w-full max-w-3xl mx-auto" />;
  }

  const latestCalc = calculations && calculations.length > 0 ? calculations[0] : null;
  const activePayment = payments?.find(p => p.taxCalculationId === latestCalc?.id);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tax Payment</h1>
        <p className="text-muted-foreground mt-1">Settle your liability securely via Nomba Virtual Accounts.</p>
      </div>

      {!latestCalc ? (
        <Card className="text-center p-8 border-dashed">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">No Calculations Found</h2>
            <p className="text-muted-foreground mb-4">You need to calculate your tax before you can make a payment.</p>
            <Button onClick={() => window.location.href = '/tax'}>Calculate Tax Now</Button>
          </CardContent>
        </Card>
      ) : activePayment?.status === 'confirmed' ? (
        <Card className="border-green-200 dark:border-green-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Complete</CardTitle>
            <CardDescription>Your tax liability for {latestCalc.taxYear} is settled.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-muted/30 rounded-xl p-6 border max-w-sm mx-auto space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold">{formatNaira(activePayment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDate(activePayment.paidAt || activePayment.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-sm">{activePayment.reference}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-2 pb-8">
            <Button onClick={() => window.location.href = '/filing'}>
              Proceed to Filing Assistant
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <Card className="shadow-md">
            <CardHeader className="bg-secondary text-secondary-foreground">
              <CardTitle>Amount Due</CardTitle>
              <CardDescription className="text-secondary-foreground/70">Tax Year {latestCalc.taxYear}</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-4xl font-extrabold mb-2">{formatNaira(latestCalc.taxLiability)}</div>
              <p className="text-sm text-muted-foreground">Includes all calculated reliefs and bands</p>
            </CardContent>
            {!activePayment && (
              <CardFooter className="bg-muted/20 border-t p-4">
                <Button 
                  className="w-full h-12 text-base" 
                  onClick={() => handleGenerateAccount(latestCalc.id)}
                  disabled={createPaymentMutation.isPending}
                >
                  {createPaymentMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                  Generate Virtual Account
                </Button>
              </CardFooter>
            )}
          </Card>

          {activePayment && activePayment.status === 'pending' && (
            <Card className="border-primary shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                Awaiting Transfer
              </div>
              <CardHeader>
                <CardTitle>Transfer Details</CardTitle>
                <CardDescription>Send exactly {formatNaira(activePayment.amount)} to this account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-5 bg-muted/50 rounded-xl border border-primary/20 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Bank Name</p>
                    <p className="font-medium text-lg">{activePayment.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Account Number</p>
                    <div className="flex items-center justify-between bg-background border rounded-md p-2">
                      <span className="font-mono text-xl tracking-wider font-bold">{activePayment.virtualAccountNumber}</span>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(activePayment.virtualAccountNumber)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Account Name</p>
                    <p className="font-medium">{activePayment.accountName}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900 text-sm flex gap-3 text-yellow-800 dark:text-yellow-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>In this sandbox environment, click the button below to simulate a successful transfer.</p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white" 
                  onClick={() => handleConfirmPayment(activePayment.id)}
                  disabled={confirmPaymentMutation.isPending}
                >
                  {confirmPaymentMutation.isPending ? "Confirming..." : "Simulate Transfer Success"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}

      {payments && payments.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${payment.status === 'confirmed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Tax Payment</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNaira(payment.amount)}</p>
                    <p className={`text-xs font-medium ${payment.status === 'confirmed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {payment.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
