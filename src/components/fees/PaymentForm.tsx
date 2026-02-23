"use client";

import { useState } from "react";
import { CreditCard, DollarSign, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function PaymentForm() {
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Payment recorded successfully", {
        description: "Transaction ID: TXN_8829310",
      });
    }, 1000);
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 py-4">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Record New Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Select Student
              </label>
              <Select>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue placeholder="Search student..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s1">John Doe (Grade 10-A)</SelectItem>
                  <SelectItem value="s2">Jane Smith (Grade 10-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Fee Category
              </label>
              <Select>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue placeholder="Select fee item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="f1">Annual Tuition ($2,500)</SelectItem>
                  <SelectItem value="f2">Laboratory Fee ($300)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Amount to Pay
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="0.00"
                  className="pl-9 bg-slate-50 border-none"
                  type="number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Payment Method
              </label>
              <Select defaultValue="cash">
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-x-2">
                      <Wallet className="h-4 w-4" /> Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-x-2">
                      <CreditCard className="h-4 w-4" /> Online Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">Bank Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex items-center justify-between">
          <div className="text-sm text-slate-500">
            <p>
              Outstanding Balance:{" "}
              <span className="text-red-500 font-bold">$2,800</span>
            </p>
          </div>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="gap-x-2 px-8"
          >
            {loading ? "Processing..." : "Confirm Payment"}
            {!loading && <CheckCircle2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
