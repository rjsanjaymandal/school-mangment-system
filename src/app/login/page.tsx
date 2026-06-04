"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GraduationCap, Loader2, User, Shield, Heart, ArrowRight } from "lucide-react";
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
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  { 
    id: "teacher", 
    label: "Teacher", 
    icon: User, 
    description: "Teaching & grade management",
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  { 
    id: "student", 
    label: "Student", 
    icon: GraduationCap, 
    description: "View grades & attendance",
    accent: "text-violet-400 bg-violet-500/10 border-violet-500/20"
  },
  { 
    id: "parent", 
    label: "Parent", 
    icon: Heart, 
    description: "Monitor child progress",
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
];

export default function LoginPage() {
  const router = useRouter();
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
        router.push("/launcher");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#03050d] px-4 font-sans">
      {/* Immersive background decorative structures */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* High-tech structural wireframe grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Animated Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <div className="w-auto h-24 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.3)] relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Image 
                src="/logo-rounded-v2.png" 
                alt="Edu Maysan" 
                width={280}
                height={88}
                className="object-contain shadow-xl"
                style={{ width: 'auto', height: '100%' }}
                priority
              />
            </div>
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">Edu Maysan</span>
          </Link>
        </div>

        {!selectedRole ? (
          /* Role Selection Cards */
          <Card className="border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
            
            <CardHeader className="pb-5 border-b border-white/[0.06] text-center pt-8 bg-white/[0.01]">
              <CardTitle className="text-lg font-bold text-white uppercase tracking-wider text-xs">Select Account Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-8 space-y-3 px-6">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300 text-left group"
                >
                  <div className={cn(
                    "p-3 rounded-lg border flex items-center justify-center transition-colors duration-300",
                    role.accent
                  )}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">{role.label}</p>
                    <p className="text-xs text-white/40 font-medium">{role.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/20 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all duration-300" />
                </button>
              ))}
              <div className="pt-4 text-center">
                <Link href="/" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors uppercase tracking-widest">
                  View School Website
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Login Form */
          <Card className="border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
            
            <CardHeader className="pb-5 border-b border-white/[0.06] pt-8 bg-white/[0.01]">
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-3 text-left flex items-center gap-1 transition-colors uppercase tracking-wider"
              >
                ← Back to types
              </button>
              <CardTitle className="text-lg font-bold text-white uppercase tracking-wider text-xs">
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
                        <FormLabel className="text-xs font-bold text-white/50 uppercase tracking-wider">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            {...field} 
                            className="rounded-lg bg-white/[0.02] border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/10 text-white placeholder-white/20 transition-all duration-300 h-11"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-white/50 uppercase tracking-wider">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="rounded-lg bg-white/[0.02] border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/10 text-white placeholder-white/20 transition-all duration-300 h-11"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                      {error}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.01]" 
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