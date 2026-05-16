"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register a professional font if needed, but standard ones are safe
// Font.register({ family: 'Helvetica-Bold', src: 'https://fonts.gstatic.com/s/helveticaneue/v70/...)

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  border: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: '1pt solid #e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '2pt solid #10b981',
    paddingBottom: 15,
  },
  schoolInfo: {
    flexDirection: 'column',
  },
  schoolName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#064e3b',
    textTransform: 'uppercase',
  },
  schoolTagline: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#0f172a',
  },
  studentInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  infoItem: {
    width: '33%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontFamily: 'Helvetica-Bold',
  },
  tableCell: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    flex: 1,
    textAlign: 'center',
  },
  tableCellSubject: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 12,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryBox: {
    width: '48%',
    padding: 10,
    border: '1pt solid #e2e8f0',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    color: '#064e3b',
    borderBottom: '1pt solid #f1f5f9',
    paddingBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  footer: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: 120,
    borderTop: '1pt solid #94a3b8',
    paddingTop: 5,
    textAlign: 'center',
    fontSize: 8,
    color: '#64748b',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    fontSize: 60,
    color: '#f1f5f9',
    transform: 'rotate(-45deg)',
    zIndex: -1,
  }
});

interface ReportCardData {
  school: {
    name: string;
    address: string;
    phone: string;
    email: string;
    session: string;
  };
  student: {
    name: string;
    rollNo: string;
    class: string;
    section: string;
    admissionNo: string;
    attendance: string;
  };
  results: {
    subject: string;
    theory: number;
    practical: number;
    total: number;
    grade: string;
    remarks: string;
  }[];
  summary: {
    grandTotal: number;
    maxTotal: number;
    percentage: string;
    finalGrade: string;
    result: string;
    rank: string;
  };
}

export function ReportCardTemplate({ data }: { data: ReportCardData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border} />
        
        {/* Watermark */}
        <Text style={styles.watermark}>OFFICIAL COPY</Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{data.school.name}</Text>
            <Text style={styles.schoolTagline}>{data.school.address}</Text>
            <Text style={styles.schoolTagline}>Phone: {data.school.phone} | Email: {data.school.email}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>SESSION {data.school.session}</Text>
          </View>
        </View>

        <Text style={styles.reportTitle}>Annual Academic Performance Report</Text>

        {/* Student Info */}
        <View style={styles.studentInfoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Student Name</Text>
            <Text style={styles.infoValue}>{data.student.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Roll Number</Text>
            <Text style={styles.infoValue}>{data.student.rollNo}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Admission No</Text>
            <Text style={styles.infoValue}>{data.student.admissionNo}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Class & Section</Text>
            <Text style={styles.infoValue}>{data.student.class} - {data.student.section}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Attendance</Text>
            <Text style={styles.infoValue}>{data.student.attendance}</Text>
          </View>
        </View>

        {/* Results Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellSubject]}>SUBJECT</Text>
            <Text style={styles.tableCell}>THEORY</Text>
            <Text style={styles.tableCell}>PRAC.</Text>
            <Text style={styles.tableCell}>TOTAL</Text>
            <Text style={styles.tableCell}>GRADE</Text>
          </View>
          {data.results.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellSubject]}>{item.subject}</Text>
              <Text style={styles.tableCell}>{item.theory}</Text>
              <Text style={styles.tableCell}>{item.practical}</Text>
              <Text style={styles.tableCell}>{item.total}</Text>
              <Text style={styles.tableCell}>{item.grade}</Text>
            </View>
          ))}
        </View>

        {/* Summary Boxes */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>RESULT SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text>Total Marks:</Text>
              <Text style={styles.infoValue}>{data.summary.grandTotal} / {data.summary.maxTotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Percentage:</Text>
              <Text style={styles.infoValue}>{data.summary.percentage}%</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Final Grade:</Text>
              <Text style={styles.infoValue}>{data.summary.finalGrade}</Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>PERFORMANCE STATUS</Text>
            <View style={styles.summaryRow}>
              <Text>Class Rank:</Text>
              <Text style={styles.infoValue}>{data.summary.rank}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Result Status:</Text>
              <Text style={[styles.infoValue, { color: data.summary.result === 'PASS' ? '#059669' : '#dc2626' }]}>
                {data.summary.result}
              </Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureLine}>
            <Text>Class Teacher</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Principal</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Parent Signature</Text>
          </View>
        </View>

        <Text style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 7, color: '#94a3b8' }}>
          This is a computer-generated report card and does not require an ink signature.
        </Text>
      </Page>
    </Document>
  );
}
