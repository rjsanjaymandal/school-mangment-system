"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GraduationCap, Loader2, ArrowLeft, Info, ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get("role") || "Standard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/launcher");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 relative overflow-hidden font-sans page-fade-in">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[400px] relative z-10 space-y-10">
        {/* Navigation & Role Indicator */}
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group">
            <LayoutGrid className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Switch Workspace
          </Link>
          <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/30">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{selectedRole}</span>
          </div>
        </div>

        <Card className="border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] soft-shadow-lg overflow-hidden transition-all duration-500">
          <CardHeader className="space-y-6 flex flex-col items-center pt-12 pb-8 text-center">
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-3xl shadow-sm transform group-hover:scale-110 transition-transform">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Authenticate to access your dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-12 px-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity Profile</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@institution.com" 
                          {...field} 
                          className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 rounded-2xl h-14 focus-visible:ring-blue-500 focus-visible:ring-1 transition-all font-medium px-6 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Access Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 rounded-2xl h-14 focus-visible:ring-blue-500 focus-visible:ring-1 transition-all px-6 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="flex items-center gap-x-3 p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-[11px] font-bold text-rose-600 dark:text-rose-400 animate-in fade-in zoom-in duration-300">
                    <Info className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-sm hover:opacity-90 active:scale-[0.98] transition-all text-base mt-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-x-2">
                      Authorize Access <ChevronRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Footer Branding */}
        <div className="text-center pt-2">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">
            Edu Maysan Professional
          </p>
        </div>
      </div>
    </div>
  );
}
