import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, FileCheck, Loader2 } from "lucide-react";

import { useCreateStatement, getListStatementsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const uploadSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountName: z.string().min(2, "Account name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  periodFrom: z.string().min(1, "Start date is required"),
  periodTo: z.string().min(1, "End date is required"),
  rawData: z.string().min(10, "Please paste your statement CSV data"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      periodFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st of current year
      periodTo: new Date().toISOString().split('T')[0], // Today
      rawData: "",
    },
  });

  const uploadMutation = useCreateStatement();

  const onSubmit = (data: UploadFormValues) => {
    uploadMutation.mutate(
      { data },
      {
        onSuccess: (statement) => {
          queryClient.invalidateQueries({ queryKey: getListStatementsQueryKey() });
          toast({
            title: "Statement Uploaded",
            description: "Your statement has been securely uploaded and is being analyzed.",
          });
          setLocation("/transactions");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error?.message || "There was an error processing your statement.",
          });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Statement</h1>
        <p className="text-muted-foreground mt-1">Provide your bank statement for AI categorization and tax analysis.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Statement Details</CardTitle>
          <CardDescription>Enter your account details and paste your transaction history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Zenith Bank, GTB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chioma Okafor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border rounded-xl overflow-hidden mt-6">
                <div className="flex border-b bg-muted/30">
                  <button 
                    type="button"
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'paste' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                    onClick={() => setActiveTab('paste')}
                  >
                    <FileText className="h-4 w-4" />
                    Paste CSV Data
                  </button>
                  <button 
                    type="button"
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </button>
                </div>

                <div className="p-4 bg-background">
                  {activeTab === 'paste' ? (
                    <FormField
                      control={form.control}
                      name="rawData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">CSV Data</FormLabel>
                          <FormDescription className="mb-2">
                            Copy and paste the contents of your bank statement CSV file here. Ensure it includes dates, descriptions, and amounts.
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Date,Description,Amount,Balance&#10;01/01/2025,Salary from Acme Corp,500000,500000&#10;..." 
                              className="font-mono text-sm h-64 resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium">Click to upload or drag and drop</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">CSV or Excel files up to 10MB</p>
                      <Button type="button" variant="outline">Select File</Button>
                      <p className="text-xs text-muted-foreground mt-4 italic">
                        File upload is disabled in this mockup. Please use the "Paste CSV" tab instead.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploadMutation.isPending}
                  className="min-w-[150px]"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Analyze Statement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
