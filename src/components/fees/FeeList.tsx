"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Plus,
  CreditCard,
  DollarSign,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeeListProps {
  initialData: any[];
}

export function FeeList({ initialData }: FeeListProps) {
  const [data, setData] = useState<any[]>(initialData);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-blue-100 italic">Expected Revenue</p>
              <DollarSign className="h-5 w-5 text-blue-200" />
            </div>
            <h2 className="text-3xl font-bold">$125,000</h2>
            <p className="text-xs text-blue-200 mt-2">Annual total expected</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-green-100 italic">Collected</p>
              <ArrowUpRight className="h-5 w-5 text-green-200" />
            </div>
            <h2 className="text-3xl font-bold">$98,450</h2>
            <p className="text-xs text-green-200 mt-2">78.7% collection rate</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-red-100 italic">Outstanding</p>
              <CreditCard className="h-5 w-5 text-red-200" />
            </div>
            <h2 className="text-3xl font-bold">$26,550</h2>
            <p className="text-xs text-red-200 mt-2">Follow up required</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Fee Structures</h3>
          <Button className="gap-x-2">
            <Plus className="h-4 w-4" />
            Create Fee Type
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-slate-500"
                  >
                    No fee structures defined.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((fee) => (
                  <TableRow
                    key={fee.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="font-semibold text-slate-900">
                      {fee.name}
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">
                      ${fee.amount}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-x-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(fee.due_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-xs truncate">
                      {fee.description || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Structure</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
