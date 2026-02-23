"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Class } from "@/types/database";
import { AttendanceService } from "@/lib/services/attendance";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AttendanceHistoryProps {
  classes: Class[];
}

export function AttendanceHistory({ classes }: AttendanceHistoryProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchHistory = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        *,
        student:students(
          id,
          roll_number,
          profile:profiles(first_name, last_name)
        )
      `,
      )
      .eq("class_id", selectedClass)
      .eq("date", selectedDate);

    if (data) {
      setRecords(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedClass) {
      fetchHistory();
    }
  }, [selectedClass, selectedDate]);

  return (
    <div className="space-y-4">
      <Card
        variant="glass"
        className="flex flex-wrap gap-4 items-end p-4 border-none shadow-sm"
      >
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-slate-600">Class</label>
          <Select onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-slate-50 border-none">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-slate-600">Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border-none"
          />
        </div>
        <Button
          variant="neon"
          onClick={fetchHistory}
          disabled={!selectedClass}
          size="sm"
          className="gap-x-2"
        >
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
      </Card>

      <Card variant="glass" className="overflow-hidden border-none shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading records...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-slate-500"
                >
                  {selectedClass
                    ? "No records found for this date."
                    : "Select a class to view history."}
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.student?.roll_number || "N/A"}
                  </TableCell>
                  <TableCell>
                    {record.student?.profile?.first_name}{" "}
                    {record.student?.profile?.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="futuristic"
                      className={cn(
                        record.status === "present"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20",
                      )}
                    >
                      {record.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 italic text-sm">
                    {record.remarks || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
