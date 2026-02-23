"use client";

import { useState, useRef } from "react";
import {
  Award,
  Download,
  Share2,
  Printer,
  ShieldCheck,
  GraduationCap,
  Star,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CertificatesPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Transcript Engine
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Institutional Credentials and Verification Services
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Share2 className="h-4 w-4" />
            Verify Portal
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue min-w-[160px]"
          >
            {isGenerating ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isGenerating ? "Engraving..." : "Issue Certificate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Certificate Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div
            ref={certRef}
            className="aspect-[1.414/1] w-full bg-white rounded-3xl shadow-2xl border-16 border-slate-900 overflow-hidden relative group"
          >
            {/* Certificate Background Elements */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-10 left-10">
                <GraduationCap className="h-64 w-64 rotate-12" />
              </div>
              <div className="absolute bottom-10 right-10">
                <Star className="h-64 w-64 -rotate-12" />
              </div>
            </div>

            <div className="absolute inset-4 border border-slate-200 rounded-xl" />

            <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
              <div className="mb-8">
                <Award className="h-20 w-20 text-slate-900 mx-auto" />
                <h1 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400 mt-4">
                  Educational Excellence
                </h1>
              </div>

              <h2 className="text-5xl font-serif text-slate-900 italic mb-2">
                Certificate of Achievement
              </h2>
              <p className="text-slate-500 font-medium tracking-widest text-xs uppercase mb-12">
                This premium credential is hereby awarded to
              </p>

              <h3 className="text-6xl font-black tracking-tighter mb-8 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Alexander Pierce
              </h3>

              <div className="max-w-md mx-auto text-slate-600 font-medium leading-relaxed mb-12 italic">
                "For outstanding academic performance and demonstration of
                exceptional mastery within the **Advanced Neural Sciences**
                curriculum for the academic year 2025-2026."
              </div>

              <div className="grid grid-cols-3 gap-x-12 w-full mt-auto">
                <div className="text-center pt-8 border-t border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date Issued
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Oct 24, 2026
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-double border-slate-900 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-slate-900" />
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">
                    Verified Hub
                  </p>
                </div>
                <div className="text-center pt-8 border-t border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Institutional Head
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-1 italic font-serif">
                    Dr. Aris Thorne
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-x-4">
            <Button className="flex-1 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold gap-x-2 border-none">
              <Printer className="h-4 w-4" />
              Print Hardcopy
            </Button>
            <Button className="flex-1 h-14 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold gap-x-2 border-none">
              <ShieldCheck className="h-4 w-4" />
              Verify on Blockchain
            </Button>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="border-none glass futuristic-card overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                <Star className="h-4 w-4 text-blue-400" />
                Credentials Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">GPA THRESHOLD</span>
                  <Badge className="bg-green-500 text-white border-none">
                    3.8 / 4.0
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">PERCENTILE</span>
                  <span className="text-slate-900">TOP 5%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">STATUS</span>
                  <Badge
                    variant="outline"
                    className="text-blue-500 border-blue-200 bg-blue-50"
                  >
                    ELIGIBLE
                  </Badge>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Template Engine
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 rounded-xl bg-slate-900 text-white text-[10px] font-bold shadow-lg neon-blue">
                    Industrial Noir
                  </button>
                  <button className="p-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold border border-slate-100 hover:bg-white hover:text-slate-900 transition-all">
                    Classic Academic
                  </button>
                  <button className="p-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold border border-slate-100 hover:bg-white hover:text-slate-900 transition-all">
                    Modern Minimal
                  </button>
                  <button className="p-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold border border-slate-100 hover:bg-white hover:text-slate-900 transition-all">
                    Neural Vibe
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none glass futuristic-card bg-blue-500 text-white p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
              <BookOpen className="h-16 w-16" />
            </div>
            <h4 className="text-lg font-black tracking-tight mb-2">
              Academic Shield
            </h4>
            <p className="text-xs opacity-80 font-medium leading-relaxed">
              All transcripts are cryptographically signed and stored in the
              institutional distributed ledger for tamper-proof verification.
            </p>
            <Button className="mt-6 w-full bg-white text-blue-600 font-black rounded-xl hover:bg-white/90">
              VIEW SECURITY LOGS
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
