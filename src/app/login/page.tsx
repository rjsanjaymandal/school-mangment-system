"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GraduationCap, Loader2, User, Shield, Heart, ArrowRight, Sun, Moon, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/providers/ThemeProvider";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const roleOptions = [
  { 
    id: "admin", 
    label: "Admin", 
    icon: Shield, 
    description: "School management & settings",
    accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  { 
    id: "teacher", 
    label: "Teacher", 
    icon: User, 
    description: "Teaching & grade management",
    accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  { 
    id: "student", 
    label: "Student", 
    icon: GraduationCap, 
    description: "View grades & attendance",
    accent: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20"
  },
  { 
    id: "parent", 
    label: "Parent", 
    icon: Heart, 
    description: "Monitor child progress",
    accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
];

const SHOW_DEMO_LOGINS = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGINS === 'true';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isDemoEmail = (email: string) => {
    const e = email.toLowerCase().trim();
    return e.endsWith('@edufox.com') || e === 'riya@maysanlabs.com';
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);

    if (isDemoEmail(values.email) && !SHOW_DEMO_LOGINS) {
      setError("Demo accounts are deactivated in this environment for security.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/portal");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const handleDemoLogin = async (role: string) => {
    if (!SHOW_DEMO_LOGINS) return;

    const credentials = {
      admin: { email: 'riya@maysanlabs.com', password: 'password123' },
      teacher: { email: 'aris@edufox.com', password: 'password123' },
      student: { email: 'std.myra.khan.0@edufox.com', password: 'password123' },
      parent: { email: 'parent.demo@edufox.com', password: 'password123' },
    }[role];

    if (credentials) {
      setSelectedRole(role);
      form.setValue('email', credentials.email);
      form.setValue('password', credentials.password);
      
      setLoading(true);
      setError(null);
      const supabase = createClient();
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          setError(error.message);
        } else {
          router.push("/portal");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 dark:bg-[#03050d] dark:text-white transition-colors duration-300 font-sans relative overflow-hidden">
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer z-50"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" /> : <Moon className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Left Panel: High-Tech Brand Showcase (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#02050d] dark:bg-[#020308] relative flex-col justify-between p-12 overflow-hidden border-r border-slate-200/20 dark:border-white/5 select-none z-10">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[90%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8s]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[90%] h-[90%] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[12s]" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_80%,transparent_100%)]" />

        {/* Top Logo branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center p-2 shadow-lg shadow-emerald-500/20">
            <GraduationCap className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <span className="text-md font-black tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 uppercase">
            Edu Maysan
          </span>
        </div>

        {/* Center Showcase content */}
        <div className="space-y-6 relative z-10 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Unified School ERP
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
            Modernize your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300">
              School Operations
            </span>
          </h1>
          
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            A state-of-the-art analytical workspace managing students, classes, attendance records, payroll, fees, and comprehensive academic reports in real-time.
          </p>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-2xl font-black text-white">99.8%</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Accuracy</p>
            </div>
            
            <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-2xl font-black text-white">Instant</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analytics Engine</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 Maysan Labs. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-350 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy</a>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Card Interface */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
        
        {/* Glow Spheres for light mode and mobile */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 dark:bg-emerald-500/[0.015] rounded-full blur-[110px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-blue-500/5 dark:bg-blue-500/[0.015] rounded-full blur-[110px] pointer-events-none z-0" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          
          {/* Logo on Mobile / Small screen */}
          <div className="flex flex-col items-center md:hidden mb-6">
            <div className="h-16 w-auto rounded-xl overflow-hidden bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-center p-2 shadow-sm">
              <Image 
                src="/logo-rounded-v2.png" 
                alt="Edu Maysan" 
                width={160}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-450 dark:text-white/40 mt-3">Edu Maysan</span>
          </div>

          {/* Desktop header title */}
          <div className="hidden md:block pb-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Please authenticate to access the workspace.</p>
          </div>

          {!selectedRole ? (
            /* Role Selection Cards */
            <Card className="border border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
              
              <CardHeader className="pb-5 border-b border-slate-200/80 dark:border-white/[0.06] text-center pt-8 bg-slate-50/20 dark:bg-white/[0.01]">
                <CardTitle className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Select Account Type</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 pb-8 space-y-4 px-6">
                <div className="space-y-2.5">
                  {roleOptions.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.05] bg-white/55 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)] transition-all duration-300 text-left group cursor-pointer"
                    >
                      <div className={cn(
                        "p-3 rounded-lg border flex items-center justify-center transition-colors duration-300",
                        role.accent
                      )}>
                        <role.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm">{role.label}</p>
                        <p className="text-xs text-slate-500 dark:text-white/40 font-medium mt-0.5">{role.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-350 dark:text-white/20 group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300" />
                    </button>
                  ))}
                </div>

                {/* Quick Demo Access Panel */}
                {SHOW_DEMO_LOGINS && (
                  <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.06] space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 text-center">
                      ✨ Quick Demo Access
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map((role) => (
                        <button
                          key={`demo-${role.id}`}
                          onClick={() => handleDemoLogin(role.id)}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200/50 dark:border-white/[0.05] bg-white/50 dark:bg-white/[0.01] hover:bg-slate-100/50 dark:hover:bg-white/[0.03] hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all duration-300 text-left group disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                          <role.icon className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                            role.id === "admin" ? "text-emerald-600 dark:text-emerald-400" :
                            role.id === "teacher" ? "text-blue-600 dark:text-blue-400" :
                            role.id === "student" ? "text-violet-600 dark:text-violet-400" :
                            "text-amber-600 dark:text-amber-400"
                          )} />
                          <span className="text-xs font-bold text-slate-700 dark:text-white/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            As {role.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <Link href="/" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline transition-colors uppercase tracking-widest">
                    View School Website
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Login Form */
            <Card className="border border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl relative animate-fade-in">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
              
              <CardHeader className="pb-5 border-b border-slate-200/80 dark:border-white/[0.06] pt-8 bg-slate-50/20 dark:bg-white/[0.01]">
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 mb-3 text-left flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  ← Back to types
                </button>
                <CardTitle className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Login as {roleOptions.find(r => r.id === selectedRole)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-8 px-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-xs font-bold text-slate-550 dark:text-white/50 uppercase tracking-wider">Email</FormLabel>
                            {SHOW_DEMO_LOGINS && (
                              <button
                                type="button"
                                onClick={() => {
                                  const creds = {
                                    admin: 'riya@maysanlabs.com',
                                    teacher: 'aris@edufox.com',
                                    student: 'std.myra.khan.0@edufox.com',
                                    parent: 'parent.demo@edufox.com',
                                  }[selectedRole || ''];
                                  if (creds) {
                                    form.setValue('email', creds);
                                    form.setValue('password', 'password123');
                                  }
                                }}
                                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                              >
                                Autofill credentials
                              </button>
                            )}
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              {...field} 
                              className="rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all duration-300 h-11"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500 dark:text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-bold text-slate-550 dark:text-white/50 uppercase tracking-wider">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all duration-300 h-11"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500 dark:text-red-400" />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                        {error}
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.01] cursor-pointer" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}