"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GraduationCap, Loader2, User, Shield, Heart, ArrowRight, Sun, Moon } from "lucide-react";
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
        router.push("/portal");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const handleDemoLogin = async (role: string) => {
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
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-slate-50 text-slate-900 dark:bg-[#03050d] dark:text-white px-4 font-sans transition-colors duration-300">
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer z-50"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Immersive background decorative structures */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* High-tech structural wireframe grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Animated Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <div className="w-auto h-24 rounded-xl overflow-hidden shadow-lg dark:shadow-[0_0_60px_rgba(16,185,129,0.3)] border border-slate-200/50 dark:border-white/5 relative bg-slate-100/50 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Image 
                src="/logo-rounded-v2.png" 
                alt="Edu Maysan" 
                width={280}
                height={88}
                className="object-contain"
                style={{ width: 'auto', height: '100%' }}
                priority
              />
            </div>
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">Edu Maysan</span>
          </Link>
        </div>

        {!selectedRole ? (
          /* Role Selection Cards */
          <Card className="border border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
            
            <CardHeader className="pb-5 border-b border-slate-200/80 dark:border-white/[0.06] text-center pt-8 bg-slate-50/20 dark:bg-white/[0.01]">
              <CardTitle className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Select Account Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-8 space-y-4 px-6">
              <div className="space-y-2.5">
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.05] bg-white/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300 text-left group"
                  >
                    <div className={cn(
                      "p-3 rounded-lg border flex items-center justify-center transition-colors duration-300",
                      role.accent
                    )}>
                      <role.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm">{role.label}</p>
                      <p className="text-xs text-slate-500 dark:text-white/40 font-medium">{role.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-white/20 group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300" />
                  </button>
                ))}
              </div>

              {/* Quick Demo Access Panel */}
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
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200/50 dark:border-white/[0.05] bg-white/50 dark:bg-white/[0.01] hover:bg-slate-100/50 dark:hover:bg-white/[0.03] hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all duration-300 text-left group disabled:opacity-50 disabled:pointer-events-none"
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

              <div className="pt-2 text-center">
                <Link href="/" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline transition-colors uppercase tracking-widest">
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
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 mb-3 text-left flex items-center gap-1 transition-colors uppercase tracking-wider"
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
                          <FormLabel className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Email</FormLabel>
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
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                          >
                            Autofill credentials
                          </button>
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
                        <FormLabel className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Password</FormLabel>
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
  );
}