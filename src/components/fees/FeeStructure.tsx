"use client";

import { useState } from "react";
import { Plus, DollarSign, Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function FeeStructure() {
  const [isOpen, setIsOpen] = useState(false);
  const [fees, setFees] = useState([
    {
      id: "1",
      name: "Annual Tuition Fee",
      amount: 2500,
      due_date: "2024-06-30",
      description: "Standard annual tuition for Grade 10",
    },
    {
      id: "2",
      name: "Library Membership",
      amount: 150,
      due_date: "2024-01-15",
      description: "Access to digital and physical library",
    },
    {
      id: "3",
      name: "Laboratory Fee",
      amount: 300,
      due_date: "2024-02-10",
      description: "Science lab consumables and equipment maintenance",
    },
  ]);

  const handleCreate = () => {
    toast.success("Fee structure created");
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Fee Categories</h3>
        <Button onClick={() => setIsOpen(true)} className="gap-x-2">
          <Plus className="h-4 w-4" />
          Define New Fee
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Fee Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-semibold text-slate-900">
                    {fee.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-slate-700">
                      ${fee.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    <div className="flex items-center gap-x-1">
                      <Calendar className="h-3 w-3" />
                      {fee.due_date}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm italic">
                    {fee.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Define Fee Structure</DialogTitle>
            <DialogDescription>
              Create a new fee category for students.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-slate-500 italic">
              Fee form configuration UI goes here...
            </p>
            <div className="flex justify-end gap-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Save Fee</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
