"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GraduationCap, Loader2, User, Users, Shield, Heart, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

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
    label: "Administrator", 
    icon: Shield, 
    description: "School management & settings",
    color: "bg-emerald-100 text-emerald-600 border-emerald-200"
  },
  { 
    id: "teacher", 
    label: "Teacher", 
    icon: User, 
    description: "Teaching & grade management",
    color: "bg-blue-100 text-blue-600 border-blue-200"
  },
  { 
    id: "student", 
    label: "Student", 
    icon: GraduationCap, 
    description: "View grades & attendance",
    color: "bg-violet-100 text-violet-600 border-violet-200"
  },
  { 
    id: "parent", 
    label: "Parent", 
    icon: Heart, 
    description: "Monitor child progress",
    color: "bg-amber-100 text-amber-600 border-amber-200"
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <span className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
              Edu <span className="text-emerald-600">Maysan</span>
            </span>
          </Link>
        </div>

        {!selectedRole ? (
          /* Role Selection */
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50">
              <CardTitle className="text-lg font-semibold text-center">Select Login Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-md border-2 transition-all hover:shadow-md text-left",
                    role.color
                  )}
                >
                  <role.icon className="h-6 w-6" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{role.label}</p>
                    <p className="text-xs text-slate-500">{role.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </button>
              ))}
              <div className="pt-4 text-center">
                <Link href="/" className="text-sm text-emerald-600 hover:underline">
                  View School Website
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Login Form */
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50">
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-sm text-slate-500 hover:text-slate-700 mb-2 text-left flex items-center gap-1"
              >
                ← Back to role selection
              </button>
              <CardTitle className="text-lg font-semibold">
                Login as {roleOptions.find(r => r.id === selectedRole)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            {...field} 
                            className="rounded-md"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="rounded-md"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700" 
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