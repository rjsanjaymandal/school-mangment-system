import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleServiceError } from "../error-handler";

export const ReportsService = {
  async getStudentsWithGrades(filters?: { class_id?: string; academic_year_id?: string }) {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from("students")
        .select(`
          id,
          admission_number,
          profile:profiles(full_name, avatar_url),
          class:classes(name)
        `);

      if (filters?.class_id) query = query.eq("class_id", filters.class_id);

      const { data: students, error } = await query;
      if (error) throw error;

      const studentsWithGrades = await Promise.all((students || []).map(async (student) => {
        const { data: marks } = await supabase
          .from("marks")
          .select("marks, total_marks")
          .eq("student_id", student.id);

        const totalMarks = (marks || []).reduce((sum, m) => sum + Number(m.marks), 0);
        const totalPossible = (marks || []).reduce((sum, m) => sum + Number(m.total_marks), 0);
        const gpa = totalPossible > 0 ? (totalMarks / totalPossible * 4).toFixed(2) : "0.00";

        return {
          ...student,
          gpa,
          total_marks: totalMarks,
          total_possible: totalPossible
        };
      }));

      studentsWithGrades.sort((a, b) => parseFloat(b.gpa) - parseFloat(a.gpa));

      return { data: studentsWithGrades, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getCertificatesSummary() {
    try {
      const supabase = createClient();
      
      const { count: totalIssued, error } = await supabase
        .from("certificates")
        .select("*", { count: 'exact', head: true })
        .eq("status", "issued");

      if (error) throw error;
      return { data: { total_issued: totalIssued || 0 }, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAttendanceSummary(classId?: string, date?: string) {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from("attendance")
        .select("status");

      if (classId) query = query.eq("class_id", classId);
      if (date) query = query.eq("date", date);

      const { data: records } = await query;
      
      const total = records?.length || 0;
      const present = records?.filter(r => r.status === 'present').length || 0;
      const absent = records?.filter(r => r.status === 'absent').length || 0;
      const late = records?.filter(r => r.status === 'late').length || 0;
      const rate = total > 0 ? ((present + late) / total * 100).toFixed(2) : "0.00";

      return {
        data: {
          total,
          present,
          absent,
          late,
          rate
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getFeesSummary(academicYearId?: string) {
    try {
      const supabase = createClient();
      
      let feesQuery = supabase.from("fees").select("amount");
      if (academicYearId) feesQuery = feesQuery.eq("academic_year_id", academicYearId);
      const { data: fees } = await feesQuery;

      const { data: payments } = await supabase
        .from("payments")
        .select("amount_paid, status");

      const totalExpected = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0);
      const totalCollected = (payments || [])
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount_paid), 0);
      const rate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(2) : "0.00";

      return {
        data: {
          total_expected: totalExpected,
          total_collected: totalCollected,
          pending: totalExpected - totalCollected,
          rate
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAcademicSummary() {
    try {
      const supabase = createClient();
      
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: 'exact', head: true });

      const { count: totalTeachers } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("role", "teacher");

      const { count: totalClasses } = await supabase
        .from("classes")
        .select("*", { count: 'exact', head: true });

      const { count: totalSubjects } = await supabase
        .from("subjects")
        .select("*", { count: 'exact', head: true });

      return {
        data: {
          total_students: totalStudents || 0,
          total_teachers: totalTeachers || 0,
          total_classes: totalClasses || 0,
          total_subjects: totalSubjects || 0
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getTopPerformers(limit: number = 10) {
    try {
      const supabase = createClient();
      
      const { data: students, error } = await supabase
        .from("students")
        .select(`
          id,
          admission_number,
          profile:profiles(full_name),
          class:classes(name)
        `)
        .limit(50);

      if (error) throw error;

      const withGrades = await Promise.all((students || []).map(async (student) => {
        const { data: marks } = await supabase
          .from("marks")
          .select("marks, total_marks")
          .eq("student_id", student.id);

        const totalMarks = (marks || []).reduce((sum, m) => sum + Number(m.marks), 0);
        const totalPossible = (marks || []).reduce((sum, m) => sum + Number(m.total_marks), 0);
        
        return {
          ...student,
          gpa: totalPossible > 0 ? parseFloat((totalMarks / totalPossible * 4).toFixed(2)) : 0,
          total_marks: totalMarks
        };
      }));

      withGrades.sort((a, b) => b.gpa - a.gpa);

      return { data: withGrades.slice(0, limit), error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getExamResultsSummary(examId?: string) {
    try {
      const supabase = createClient();
      
      let query = supabase.from("marks").select("marks, total_marks");
      if (examId) query = query.eq("exam_id", examId);

      const { data: marks } = await query;

      const results = (marks || []).map(m => ({
        obtained: Number(m.marks),
        total: Number(m.total_marks),
        percentage: Number(m.total_marks) > 0 
          ? (Number(m.marks) / Number(m.total_marks) * 100) 
          : 0
      }));

      const avgPercentage = results.length > 0
        ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
        : 0;

      const passCount = results.filter(r => r.percentage >= 40).length;
      const failCount = results.filter(r => r.percentage < 40).length;
      const passRate = results.length > 0 ? ((passCount / results.length) * 100).toFixed(2) : "0.00";

      return {
        data: {
          total_students: results.length,
          average_percentage: avgPercentage.toFixed(2),
          pass_count: passCount,
          fail_count: failCount,
          pass_rate: passRate
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudentReportCard(studentId: string, examId?: string) {
    try {
      const supabase = createClient();
      
      const { data: student } = await supabase
        .from("students")
        .select(`
          id,
          admission_number,
          profile:profiles(full_name),
          class:classes(name)
        `)
        .eq("id", studentId)
        .single();

      let marksQuery = supabase
        .from("marks")
        .select(`
          marks,
          total_marks,
          subject:subjects(name)
        `)
        .eq("student_id", studentId);

      if (examId) marksQuery = marksQuery.eq("exam_id", examId);

      const { data: marks } = await marksQuery;

      const results = (marks || []).map((m: any) => ({
        subject: m.subject?.name || 'Unknown',
        obtained: Number(m.marks),
        total: Number(m.total_marks),
        grade: getGrade(Number(m.marks), Number(m.total_marks)),
        percentage: Number(m.total_marks) > 0 
          ? (Number(m.marks) / Number(m.total_marks) * 100) 
          : 0
      }));

      const totalMarks = results.reduce((sum, r) => sum + r.obtained, 0);
      const totalPossible = results.reduce((sum, r) => sum + r.total, 0);
      const overallPercentage = totalPossible > 0 ? (totalMarks / totalPossible * 100) : 0;

      return {
        data: {
          student,
          results,
          summary: {
            total_marks: totalMarks,
            total_possible: totalPossible,
            percentage: overallPercentage.toFixed(2),
            overall_grade: getGrade(totalMarks, totalPossible)
          }
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};

function getGrade(obtained: number, total: number): string {
  if (total === 0) return 'N/A';
  const percentage = (obtained / total) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}
