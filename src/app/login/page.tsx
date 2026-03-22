"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GraduationCap, Loader2 } from "lucide-react";

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
        // Fetch profile to determine role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .single();

        const role = profile?.role || "student";
        router.push("/launcher");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full -mr-24 -mt-24 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] rounded-full -ml-12 -mb-12 animate-pulse pointer-events-none" />
      
      <Card className="w-full max-w-sm border-border bg-card/60 backdrop-blur-xl rounded-sm shadow-2xl relative z-10 reveal-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary emerald-glow" />
        
        <CardHeader className="space-y-4 flex flex-col items-center pt-10 pb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-xs shadow-xl emerald-glow transition-all duration-500 hover:rotate-6">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight uppercase">
              Identity Node
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Authorize session to access core
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Command: Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="operator@maysan.sys" 
                        {...field} 
                        className="bg-accent/30 border-border rounded-xs h-12 focus-visible:ring-primary focus-visible:ring-1 transition-all font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key: Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-accent/30 border-border rounded-xs h-12 focus-visible:ring-primary focus-visible:ring-1 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold" />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-[10px] font-black text-destructive uppercase tracking-widest text-center animate-pulse">
                  Authentication Failed: {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.4em] rounded-xs shadow-2xl hover:bg-primary/90 transition-all emerald-glow" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />
                ) : (
                  "Initialize Session"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center w-full reveal-3">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground/40">
          Edu Maysan Intelligence System • v4.0.0
        </p>
      </div>
    </div>
  );
}

