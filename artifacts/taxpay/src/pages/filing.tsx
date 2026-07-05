import { useState, useEffect } from "react";
import { 
  useListTaxCalculations, 
  useCreateFilingSession,
  useGetFilingSession,
  useUpdateFilingSession,
  useListFilingSessions,
  getListFilingSessionsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronRight, FileCheck, Shield, ExternalLink, ArrowLeft, Loader2 } from "lucide-react";

export default function FilingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  
  const { data: calculations, isLoading: isLoadingCalculations } = useListTaxCalculations();
  const { data: sessions, isLoading: isLoadingSessions } = useListFilingSessions();
  
  const createSessionMutation = useCreateFilingSession();
  const updateSessionMutation = useUpdateFilingSession();

  const latestCalc = calculations && calculations.length > 0 ? calculations[0] : null;
  const activeSession = sessions?.find(s => s.taxCalculationId === latestCalc?.id);

  const startFiling = () => {
    if (!latestCalc) return;
    createSessionMutation.mutate(
      { data: { taxCalculationId: latestCalc.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFilingSessionsQueryKey() });
        }
      }
    );
  };

  const nextStep = () => {
    if (!activeSession) return;
    
    // If at step 2 (password), ensure it's filled
    if (activeSession.currentStep === 2 && !password) {
      toast({ variant: "destructive", title: "Password Required", description: "Please enter your TaxPro Max password to continue." });
      return;
    }

    const next = activeSession.currentStep + 1;
    const isCompleted = next > activeSession.totalSteps;
    
    updateSessionMutation.mutate(
      { 
        id: activeSession.id, 
        data: { 
          currentStep: isCompleted ? activeSession.totalSteps : next,
          status: isCompleted ? "completed" : "in_progress"
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFilingSessionsQueryKey() });
          if (isCompleted) {
            toast({ title: "Filing Complete", description: "Your tax returns have been successfully filed via TaxPro Max." });
          }
        }
      }
    );
  };

  if (isLoadingCalculations || isLoadingSessions) {
    return <Skeleton className="h-[500px] w-full max-w-2xl mx-auto" />;
  }

  if (!latestCalc) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 border-dashed border-2 rounded-xl">
        <FileCheck className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Calculation Available</h2>
        <p className="text-muted-foreground mb-6">Complete your tax calculation and payment first before filing.</p>
        <Button onClick={() => window.location.href = '/tax'}>Calculate Tax</Button>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TaxPro Max Filing</h1>
          <p className="text-muted-foreground mt-1">Let our assistant file your returns directly to FIRS.</p>
        </div>

        <Card className="overflow-hidden shadow-lg border-primary/20">
          <div className="bg-primary/5 p-8 text-center border-b">
            <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileCheck className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl mb-2">Automated Filing Assistant</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              We'll guide you through submitting your {latestCalc.taxYear} returns to the FIRS TaxPro Max portal using your calculated data.
            </CardDescription>
          </div>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-3 text-center mb-8">
              <div>
                <div className="font-bold text-2xl text-primary mb-1">0%</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="font-bold text-2xl text-primary mb-1">&lt; 2 min</div>
                <div className="text-sm text-muted-foreground">Average Time</div>
              </div>
              <div>
                <div className="font-bold text-2xl text-primary mb-1">Auto</div>
                <div className="text-sm text-muted-foreground">Data Fill</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg text-sm text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50 mb-6 flex items-start gap-3">
              <Shield className="h-5 w-5 shrink-0 mt-0.5" />
              <p>Security Notice: TaxPay acts as a bridge. We securely pass your credentials directly to FIRS during this session. We never store or log your TaxPro Max password.</p>
            </div>
            
            <Button 
              className="w-full h-14 text-lg" 
              onClick={startFiling}
              disabled={createSessionMutation.isPending}
            >
              Start Filing Session <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { currentStep, totalSteps, autoFillData } = activeSession;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">TaxPro Max Filing</h1>
          <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
        </div>
        {activeSession.status === 'completed' && (
          <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Filed Successfully
          </div>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="border-border shadow-md min-h-[400px] flex flex-col relative overflow-hidden">
        {activeSession.status === 'completed' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-green-50/30 dark:bg-green-900/5">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Filing Completed</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Your tax returns for {latestCalc.taxYear} have been successfully filed to the FIRS TaxPro Max portal. An email confirmation has been sent by FIRS.
            </p>
            <div className="p-4 bg-background border rounded-lg w-full max-w-sm flex justify-between items-center text-sm shadow-sm">
              <span className="text-muted-foreground">FIRS Reference:</span>
              <span className="font-mono font-bold tracking-wider">FIRS-{Math.floor(Math.random()*1000000)}</span>
            </div>
            <Button className="mt-8" onClick={() => window.location.href = '/dashboard'}>
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle>
                {currentStep === 1 && "Verify Identity"}
                {currentStep === 2 && "TaxPro Max Authentication"}
                {currentStep === 3 && "Income Declaration"}
                {currentStep === 4 && "Reliefs & Deductions"}
                {currentStep === 5 && "Review Return"}
                {currentStep === 6 && "Final Submission"}
              </CardTitle>
              <CardDescription>
                {currentStep === 2 ? "Enter your FIRS portal credentials" : "Data pre-filled from your TaxPay calculations"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center">
              
              {currentStep === 1 && (
                <div className="space-y-4 max-w-md mx-auto w-full">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">Full Name</Label>
                    <div className="p-3 bg-muted/50 rounded border font-medium text-foreground">{autoFillData.fullName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">Taxpayer Identification Number (TIN)</Label>
                    <div className="p-3 bg-muted/50 rounded border font-mono font-medium text-foreground">{autoFillData.tin || "Not Provided"}</div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 max-w-md mx-auto w-full">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex gap-3 items-start">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-primary mb-1">Enter your TaxPro Max password</p>
                      <p className="text-muted-foreground">TaxPay never stores or transmits this password. It is passed directly to the FIRS portal for this session only.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tpm-password">TaxPro Max Password</Label>
                    <Input 
                      id="tpm-password"
                      type="password" 
                      placeholder="••••••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 max-w-md mx-auto w-full">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">Tax Year</Label>
                    <div className="p-3 bg-muted/50 rounded border font-medium text-foreground">{autoFillData.taxYear}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">Gross Income (NGN)</Label>
                    <div className="p-3 bg-muted/50 rounded border font-medium text-foreground">{formatNaira(autoFillData.grossIncome || 0)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">Employment Type</Label>
                    <div className="p-3 bg-muted/50 rounded border font-medium text-foreground capitalize">{autoFillData.employmentType?.replace('_', ' ')}</div>
                  </div>
                </div>
              )}

              {currentStep > 3 && currentStep < 6 && (
                <div className="space-y-4 max-w-md mx-auto w-full text-center">
                  <FileCheck className="h-16 w-16 mx-auto text-primary opacity-20 mb-4" />
                  <h3 className="text-lg font-medium">Auto-filling FIRS forms...</h3>
                  <p className="text-muted-foreground">Transferring your calculation data to TaxPro Max.</p>
                  <div className="mt-8 space-y-3 text-left border rounded-lg p-4 bg-muted/10">
                    <div className="flex justify-between text-sm">
                      <span>Personal Relief:</span>
                      <span className="font-medium">{formatNaira(autoFillData.personalRelief || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxable Income:</span>
                      <span className="font-medium">{formatNaira(autoFillData.taxableIncome || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Final Liability:</span>
                      <span className="text-primary">{formatNaira(autoFillData.taxLiability || 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="text-center max-w-md mx-auto w-full">
                  <div className="inline-flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-6">
                    <Shield className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ready to Submit</h3>
                  <p className="text-muted-foreground mb-6">
                    By clicking submit, you confirm that the information provided is true and correct to the best of your knowledge.
                  </p>
                </div>
              )}

            </CardContent>
            <CardFooter className="p-6 border-t bg-muted/10 flex justify-end gap-3">
              <Button 
                onClick={nextStep} 
                className={currentStep === 6 ? "bg-green-600 hover:bg-green-700" : ""}
                disabled={updateSessionMutation.isPending}
              >
                {updateSessionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {currentStep === 6 ? "Final Submit to FIRS" : "Continue"} 
                {currentStep !== 6 && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
