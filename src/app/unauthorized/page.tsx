import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 text-red-600 mb-4">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
          Access Restricted
        </h1>
        <p className="text-slate-500 font-medium">
          Your credentials do not grant access to this secure segment. Please
          contact administration if you believe this is an error.
        </p>
        <Button
          asChild
          className="rounded-2xl h-12 px-8 bg-slate-900 font-bold shadow-xl"
        >
          <Link href="/">Back to Command Center</Link>
        </Button>
      </div>
    </div>
  );
}
