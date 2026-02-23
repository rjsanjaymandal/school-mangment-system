import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateCertificate = (studentName: string, achievement: string) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Background and Border
  doc.rect(5, 5, 287, 200, "S");
  doc.setDrawColor(33, 150, 243); // Blue accent
  doc.setLineWidth(1.5);
  doc.rect(10, 10, 277, 190, "S");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(33, 44, 66);
  doc.text("EDUSMART ENTERPRISE", 148.5, 45, { align: "center" });

  doc.setFontSize(20);
  doc.text("CERTIFICATE OF EXCELLENCE", 148.5, 60, { align: "center" });

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text("This is to certify that", 148.5, 85, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(59, 130, 246);
  doc.text(studentName.toUpperCase(), 148.5, 105, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(33, 44, 66);
  doc.text("has successfully achieved the distinction of", 148.5, 125, {
    align: "center",
  });

  doc.setFont("helvetica", "bold italic");
  doc.text(achievement, 148.5, 140, { align: "center" });

  // Footer / Signatures
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("________________________", 60, 175);
  doc.text("Principal", 60, 182);

  doc.text("________________________", 237, 175, { align: "center" });
  doc.text("Academic Dean", 237, 182, { align: "center" });

  doc.setFontSize(10);
  const date = new Date().toLocaleDateString();
  doc.text(`Generated on: ${date}`, 148.5, 195, { align: "center" });

  // Save the PDF
  doc.save(`${studentName}_Certificate.pdf`);
};

export const generateReportCard = (student: any, examResults: any[]) => {
  const doc = new jsPDF() as any;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ACADEMIC PERFORMANCE REPORT", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Student: ${student.name}`, 14, 40);
  doc.text(`Class: ${student.class}`, 14, 46);
  doc.text(`Term: Second Semester`, 14, 52);

  const tableData = examResults.map((res) => [
    res.subject,
    res.maxMarks,
    res.obtained,
    res.grade,
  ]);

  doc.autoTable({
    startY: 60,
    head: [["Subject", "Max Marks", "Marks Obtained", "Grade"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillStyle: [33, 44, 66] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text("Institutional Remark: Exemplary Performance", 14, finalY);

  doc.save(`${student.name}_ReportCard.pdf`);
};
