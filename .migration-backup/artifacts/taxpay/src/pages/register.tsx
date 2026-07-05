import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Zap, Loader2, CheckCircle } from "lucide-react";

import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

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

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d0d0d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34C77A]/40 focus:border-[#34C77A] transition-colors bg-white";
const labelCls = "text-xs font-semibold text-gray-700 uppercase tracking-wide";

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
      { data: { ...data, tin: data.tin || null } },
      {
        onSuccess: (response) => {
          authenticate(response.token);
          toast({ title: "Account created!", description: "Welcome to TaxPay." });
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
    <div className="min-h-screen flex font-sans">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[38%] bg-black flex-col justify-between p-12 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#34C77A] text-white p-1.5 rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">TaxPay</span>
        </Link>

        <div className="space-y-8">
          <div>
            <h2 className="text-white text-3xl font-extrabold leading-tight">
              File Your Tax,<br />
              <span className="text-[#34C77A]">From Anywhere</span><br />
              in Nigeria
            </h2>
            <p className="mt-4 text-white/50 text-sm leading-relaxed">
              Upload your bank statement. Let AI do the math. Pay securely and file on TaxPro Max — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Nigeria Tax Act 2025 compliant calculation",
              "AI chat in English, Pidgin, Hausa & Igbo",
              "Nomba virtual account for direct tax payment",
              "TaxPro Max filing assistant built-in",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-[#34C77A] shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6 text-white/40 text-xs">
          <span>Privacy Policy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden bg-black px-6 py-4 flex items-center gap-2">
          <div className="bg-[#34C77A] text-white p-1.5 rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-white text-lg font-bold">TaxPay</span>
        </div>

        <div className="flex-1 flex items-start justify-center p-8">
          <div className="w-full max-w-xl space-y-7 py-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#0d0d0d] tracking-tight">Create your account</h1>
              <p className="mt-2 text-gray-500 text-sm">Join Nigerians taking control of their taxes. Free to start.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelCls}>Full Name</FormLabel>
                        <FormControl>
                          <input placeholder="Chioma Okafor" {...field} className={inputCls} />
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
                        <FormLabel className={labelCls}>Phone Number</FormLabel>
                        <FormControl>
                          <input placeholder="08012345678" {...field} className={inputCls} />
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
                        <FormLabel className={labelCls}>Email</FormLabel>
                        <FormControl>
                          <input type="email" placeholder="chioma@example.com" {...field} className={inputCls} />
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
                        <FormLabel className={labelCls}>Password</FormLabel>
                        <FormControl>
                          <input type="password" placeholder="Min. 6 characters" {...field} className={inputCls} />
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
                        <FormLabel className={labelCls}>Employment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-[46px] rounded-xl border-gray-200 text-sm">
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
                        <FormLabel className={labelCls}>Chat Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-[46px] rounded-xl border-gray-200 text-sm">
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
                      <FormLabel className={labelCls}>Tax Identification Number (TIN)</FormLabel>
                      <FormControl>
                        <input placeholder="Optional — leave blank if you don't have one yet" {...field} className={inputCls} />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-400">
                        We'll help you get a TIN if you don't have one.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-[#34C77A] hover:bg-[#2ab56a] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {registerMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                  ) : "Create Account — Free"}
                </button>
              </form>
            </Form>

            <div className="space-y-3">
              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-[#34C77A] font-semibold hover:underline">
                  Log in
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="h-3 w-3" />
                <span>Your data is encrypted and secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
