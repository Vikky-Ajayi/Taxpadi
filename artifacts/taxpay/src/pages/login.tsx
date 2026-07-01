import { useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Zap, Loader2, Star } from "lucide-react";

import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login: authenticate } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          authenticate(response.token);
          toast({ title: "Welcome back!", description: "Successfully logged in to TaxPay." });
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error?.message || "Invalid email or password.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#34C77A] text-white p-1.5 rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">TaxPay</span>
        </Link>

        <div className="space-y-6">
          <div className="flex text-[#34C77A]">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <blockquote className="text-white text-2xl font-bold leading-snug">
            "TaxPay found ₦180,000 in missed reliefs on my salary. I didn't know I was leaving money on the table."
          </blockquote>
          <div>
            <p className="text-[#34C77A] font-semibold text-sm">Adaeze N.</p>
            <p className="text-white/50 text-sm">Software Engineer, Abuja</p>
          </div>
        </div>

        <div className="flex gap-6 text-white/40 text-xs">
          <span>Privacy Policy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile header */}
        <div className="lg:hidden bg-black px-6 py-4 flex items-center gap-2">
          <div className="bg-[#34C77A] text-white p-1.5 rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-white text-lg font-bold">TaxPay</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#0d0d0d] tracking-tight">Welcome back</h1>
              <p className="mt-2 text-gray-500 text-sm">Log in to manage your taxes and chat with your AI assistant.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</FormLabel>
                      <FormControl>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d0d0d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34C77A]/40 focus:border-[#34C77A] transition-colors"
                        />
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
                      <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</FormLabel>
                      <FormControl>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d0d0d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34C77A]/40 focus:border-[#34C77A] transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-[#34C77A] hover:bg-[#2ab56a] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loginMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</>
                  ) : "Log in"}
                </button>
              </form>
            </Form>

            <div className="space-y-4">
              <p className="text-sm text-center text-gray-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-[#34C77A] font-semibold hover:underline">
                  Sign up free
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="h-3 w-3" />
                <span>Secure, encrypted login</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
