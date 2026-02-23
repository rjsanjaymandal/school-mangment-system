import { handleServiceError } from "../error-handler";

export interface GradeComponent {
  id: string;
  label: string;
  weight: number; // e.g., 30 for 30%
  score: number; // e.g., 85
}

/**
 * Gradebook Service
 * High-precision academic computation and master transcript generation.
 */
export const GradebookService = {
  /**
   * Computes the weighted GPA for a set of grade components.
   */
  calculateGPA(components: GradeComponent[]): number {
    try {
      const totalWeight = components.reduce((acc, c) => acc + c.weight, 0);
      if (totalWeight === 0) return 0;

      const weightedSum = components.reduce(
        (acc, c) => acc + c.score * (c.weight / 100),
        0
      );
      return Number(weightedSum.toFixed(2));
    } catch (error) {
      return handleServiceError(error);
    }
  },

  /**
   * Returns a letter grade based on GPA score.
   */
  getGradeLetter(gpa: number): string {
    if (gpa >= 90) return "A+";
    if (gpa >= 80) return "A";
    if (gpa >= 70) return "B";
    if (gpa >= 60) return "C";
    return "D";
  }
};
