"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportCardTemplate } from './ReportCardTemplate';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for demonstration
const mockReportData = {
  school: {
    name: "EDUMAYSAN INTERNATIONAL SCHOOL",
    address: "123 Academic Hub, Knowledge City, PIN 560001",
    phone: "+91 98765 43210",
    email: "admin@edumaysan.edu",
    session: "2023-24"
  },
  student: {
    name: "ADITYA SHARMA",
    rollNo: "24",
    class: "VIII",
    section: "A",
    admissionNo: "EMS/2021/442",
    attendance: "182 / 195 (93%)"
  },
  results: [
    { subject: "Mathematics", theory: 78, practical: 18, total: 96, grade: "A1", remarks: "Excellent" },
    { subject: "Science", theory: 72, practical: 19, total: 91, grade: "A1", remarks: "Brilliant" },
    { subject: "English Language", theory: 84, practical: 0, total: 84, grade: "A2", remarks: "Very Good" },
    { subject: "Social Studies", theory: 65, practical: 15, total: 80, grade: "B1", remarks: "Good" },
    { subject: "Hindi Language", theory: 88, practical: 0, total: 88, grade: "A2", remarks: "Outstanding" },
    { subject: "Computer Science", theory: 45, practical: 48, total: 93, grade: "A1", remarks: "Skilled" },
  ],
  summary: {
    grandTotal: 532,
    maxTotal: 600,
    percentage: "88.6",
    finalGrade: "A2",
    result: "PASS",
    rank: "3rd in Class"
  }
};

export function ReportCardDownloadButton() {
  return (
    <div className="flex flex-col items-center">
      <PDFDownloadLink
        document={<ReportCardTemplate data={mockReportData} />}
        fileName={`ReportCard_${mockReportData.student.name.replace(' ', '_')}.pdf`}
      >
        {({ loading }) => (
          <Button 
            variant="outline" 
            className="glass futuristic-card border border-emerald-100 hover:bg-emerald-50 text-emerald-700 font-bold py-6 px-8 rounded-2xl flex flex-col items-center gap-2 h-auto"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest block">Generate Report Card</span>
              <span className="text-[10px] font-normal opacity-70 block mt-0.5">Professional A4 PDF Format</span>
            </div>
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
}
