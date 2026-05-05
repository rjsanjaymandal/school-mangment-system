import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Shield, User, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  let user = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    // Continue without auth
  }

  if (user) {
    redirect("/launcher");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-emerald-600 text-white p-3 rounded-md">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <span className="font-bold text-2xl text-slate-900">Edu Maysan</span>
            <span className="text-xs text-slate-500 block">School Management System</span>
          </div>
        </div>

        {/* Quick Login Options */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-slate-600 text-center mb-4">Select your role to continue</p>
            
            <Link href="/login?role=admin" className="block">
              <Button variant="outline" className="w-full rounded-md h-12 justify-between">
                <span className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">Administrator</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/login?role=teacher" className="block">
              <Button variant="outline" className="w-full rounded-md h-12 justify-between">
                <span className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Teacher</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/login?role=student" className="block">
              <Button variant="outline" className="w-full rounded-md h-12 justify-between">
                <span className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-violet-600" />
                  <span className="font-medium">Student</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/login?role=parent" className="block">
              <Button variant="outline" className="w-full rounded-md h-12 justify-between">
                <span className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Parent / Guardian</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Edu Maysan ERP v2.0 • Powered by Supabase
        </p>
      </div>
    </div>
  );
}