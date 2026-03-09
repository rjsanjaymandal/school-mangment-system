"use client";

/**
 * PDF Export Utility
 * Generates downloadable PDF-like HTML documents for report cards, fee receipts, etc.
 * Uses browser's built-in print-to-PDF capability for clean output.
 */

export interface ReportCardData {
    studentName: string;
    className: string;
    admissionNumber: string;
    academicYear: string;
    subjects: { name: string; marks: number; maxMarks: number; grade: string }[];
    attendance: { totalDays: number; present: number };
    conductScore: number;
}

export interface FeeReceiptData {
    studentName: string;
    className: string;
    receiptNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    feeType: string;
    status: string;
}

function getGrade(marks: number, max: number): string {
    const pct = (marks / max) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 35) return "D";
    return "F";
}

function openPrintWindow(title: string, content: string) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
        .header { text-align: center; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
        .header p { font-size: 12px; color: #64748b; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 30px; }
        .info-item { font-size: 12px; }
        .info-item strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #1e293b; color: white; padding: 12px 16px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        td { padding: 10px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        tr:hover { background: #f8fafc; }
        .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 30px; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
        .summary-box .value { font-size: 24px; font-weight: 900; }
        .summary-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 4px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
        .stamp { display: inline-block; border: 2px solid #1e293b; border-radius: 8px; padding: 8px 24px; font-weight: 900; font-size: 14px; margin-top: 20px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      ${content}
      <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `);
    win.document.close();
}

export function generateReportCard(data: ReportCardData) {
    const totalObtained = data.subjects.reduce((s, sub) => s + sub.marks, 0);
    const totalMax = data.subjects.reduce((s, sub) => s + sub.maxMarks, 0);
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0";
    const attendancePct = data.attendance.totalDays > 0
        ? ((data.attendance.present / data.attendance.totalDays) * 100).toFixed(1)
        : "0";

    const subjectRows = data.subjects.map(s => `
    <tr>
      <td>${s.name}</td>
      <td style="text-align:center">${s.marks}</td>
      <td style="text-align:center">${s.maxMarks}</td>
      <td style="text-align:center; font-weight:bold">${s.grade}</td>
    </tr>
  `).join("");

    openPrintWindow(`Report Card - ${data.studentName}`, `
    <div class="header">
      <h1>EduFox School ERP</h1>
      <p>Academic Report Card — ${data.academicYear}</p>
    </div>
    <div class="info-grid">
      <div class="info-item"><strong>Student Name</strong>${data.studentName}</div>
      <div class="info-item"><strong>Class</strong>${data.className}</div>
      <div class="info-item"><strong>Admission No</strong>${data.admissionNumber}</div>
      <div class="info-item"><strong>Academic Year</strong>${data.academicYear}</div>
    </div>
    <table>
      <thead><tr><th>Subject</th><th style="text-align:center">Marks</th><th style="text-align:center">Max</th><th style="text-align:center">Grade</th></tr></thead>
      <tbody>
        ${subjectRows}
        <tr style="font-weight:bold;background:#f1f5f9">
          <td>TOTAL</td>
          <td style="text-align:center">${totalObtained}</td>
          <td style="text-align:center">${totalMax}</td>
          <td style="text-align:center">${getGrade(totalObtained, totalMax)}</td>
        </tr>
      </tbody>
    </table>
    <div class="summary">
      <div class="summary-box"><div class="value">${percentage}%</div><div class="label">Overall Percentage</div></div>
      <div class="summary-box"><div class="value">${attendancePct}%</div><div class="label">Attendance</div></div>
      <div class="summary-box"><div class="value">+${data.conductScore}</div><div class="label">Conduct Score</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:60px">
      <div style="text-align:center"><div style="border-top:1px solid #1e293b;width:200px;padding-top:8px;font-size:12px">Class Teacher</div></div>
      <div style="text-align:center"><div class="stamp">VERIFIED</div></div>
      <div style="text-align:center"><div style="border-top:1px solid #1e293b;width:200px;padding-top:8px;font-size:12px">Principal</div></div>
    </div>
    <div class="footer">Generated by EduFox School ERP • ${new Date().toLocaleDateString()}</div>
  `);
}

export function generateFeeReceipt(data: FeeReceiptData) {
    openPrintWindow(`Fee Receipt - ${data.receiptNumber}`, `
    <div class="header">
      <h1>EduFox School ERP</h1>
      <p>Official Fee Receipt</p>
    </div>
    <div class="info-grid">
      <div class="info-item"><strong>Receipt No</strong>${data.receiptNumber}</div>
      <div class="info-item"><strong>Date</strong>${data.paymentDate}</div>
      <div class="info-item"><strong>Student</strong>${data.studentName}</div>
      <div class="info-item"><strong>Class</strong>${data.className}</div>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Method</th><th>Status</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        <tr>
          <td>${data.feeType}</td>
          <td>${data.paymentMethod}</td>
          <td><span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:99px;font-size:10px;font-weight:bold">${data.status.toUpperCase()}</span></td>
          <td style="text-align:right;font-weight:bold;font-size:18px">₹${data.amount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    <div class="summary">
      <div class="summary-box"><div class="value">₹${data.amount.toLocaleString()}</div><div class="label">Amount Paid</div></div>
      <div class="summary-box"><div class="value">${data.paymentMethod}</div><div class="label">Payment Method</div></div>
      <div class="summary-box"><div class="value">${data.status}</div><div class="label">Status</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:60px">
      <div style="text-align:center"><div style="border-top:1px solid #1e293b;width:200px;padding-top:8px;font-size:12px">Accountant</div></div>
      <div style="text-align:center"><div class="stamp">PAID</div></div>
      <div style="text-align:center"><div style="border-top:1px solid #1e293b;width:200px;padding-top:8px;font-size:12px">Authorized Signatory</div></div>
    </div>
    <div class="footer">Generated by EduFox School ERP • ${new Date().toLocaleDateString()}</div>
  `);
}
