import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Zap, Loader2 } from "lucide-react";

import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  tin: z.string().optional(),
  language: z.enum(["en", "pidgin", "ha", "ig"]),
  employmentType: z.enum(["salaried", "freelancer", "business_owner", "other"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login: authenticate } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phone: "",
      tin: "",
      language: "en",
      employmentType: "freelancer",
    },
  });

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { 
        data: {
          ...data,
          tin: data.tin || null
        } 
      },
      {
        onSuccess: (response) => {
          authenticate(response.token);
          toast({
            title: "Account created!",
            description: "Welcome to TaxPay.",
          });
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: error?.message || "There was a problem creating your account.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-xl mb-8 flex justify-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:bg-primary/90 transition-colors shadow-sm">
            <Zap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">TaxPay</span>
        </Link>
      </div>

      <Card className="w-full max-w-xl border-border shadow-xl rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Join 15 million Nigerians taking control of their taxes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Chioma Okafor" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="08012345678" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="chioma@example.com" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salaried">Salaried</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="business_owner">Business Owner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Chat Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pidgin">Pidgin</SelectItem>
                          <SelectItem value="ha">Hausa</SelectItem>
                          <SelectItem value="ig">Igbo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Identification Number (TIN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} className="h-11" />
                    </FormControl>
                    <FormDescription>
                      Leave blank if you don't have one yet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base shadow-sm mt-4"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t bg-muted/20 px-6 py-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Your data is encrypted and secure</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
