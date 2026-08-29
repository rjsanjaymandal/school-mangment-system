"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/portal");
        }, 2500);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#03050d] p-4 text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
            <GraduationCap className="h-6 w-6 text-slate-950 font-bold" />
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-white/50">
            Set a new secure password for your Edu Maysan ERP account.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6">
          {success ? (
            <div className="space-y-4 py-4 text-center">
              <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Password Updated Successfully</h3>
              <p className="text-xs text-slate-500 dark:text-white/60">
                Your password has been changed. Redirecting to your workspace portal...
              </p>
              <Button
                onClick={() => router.push("/portal")}
                className="w-full h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider"
              >
                Go to Workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/50 text-slate-900 dark:text-white h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/50 text-slate-900 dark:text-white h-10 text-xs"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium leading-tight">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer"
              >
                {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                Update Password
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-[10px] font-bold text-slate-500 dark:text-white/40 hover:text-emerald-500 uppercase tracking-wider transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
