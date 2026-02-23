import { describe, it, expect } from 'vitest'
import { GradebookService, GradeComponent } from '@/lib/services/gradebook'

describe('GradebookService', () => {
  describe('calculateGPA', () => {
    it('should calculate weighted average correctly', () => {
      const components: GradeComponent[] = [
        { id: '1', label: 'Midterm', weight: 40, score: 80 },
        { id: '2', label: 'Final', weight: 60, score: 90 },
      ]
      // (80 * 0.4) + (90 * 0.6) = 32 + 54 = 86
      expect(GradebookService.calculateGPA(components)).toBe(86)
    })

    it('should return 0 for empty components', () => {
      expect(GradebookService.calculateGPA([])).toBe(0)
    })

    it('should handle decimal scores and weights', () => {
      const components: GradeComponent[] = [
        { id: '1', label: 'Test', weight: 33.33, score: 75.5 },
        { id: '2', label: 'Exam', weight: 66.67, score: 88.2 },
      ]
      // (75.5 * 0.3333) + (88.2 * 0.6667) = 25.16415 + 58.80294 = 83.96709 -> 83.97
      expect(GradebookService.calculateGPA(components)).toBe(83.97)
    })
  })

  describe('getGradeLetter', () => {
    it('should map scores to correct letters', () => {
      expect(GradebookService.getGradeLetter(95)).toBe('A+')
      expect(GradebookService.getGradeLetter(85)).toBe('A')
      expect(GradebookService.getGradeLetter(75)).toBe('B')
      expect(GradebookService.getGradeLetter(65)).toBe('C')
      expect(GradebookService.getGradeLetter(55)).toBe('D')
    })
  })
})
