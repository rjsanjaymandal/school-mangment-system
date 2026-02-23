import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConductService } from '@/lib/services/conduct'
import { createClient } from '@/lib/supabase/client'

const mockSupabase = createClient() as any

describe('ConductService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('recordConduct', () => {
    it('should successfully record a valid merit incident', async () => {
      const mockIncident = {
        student_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'merit',
        points: 10,
        incident_date: '2024-01-01',
        description: 'Excellent project',
        category: 'Academics',
        teacher_id: '550e8400-e29b-41d4-a716-446655440001'
      }

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '550e8400-e29b-41d4-a716-446655440002', ...mockIncident }, error: null })
      } as any)

      const result = (await ConductService.recordConduct(mockIncident)) as any
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440002')
      expect(result.points).toBe(10)
    })
  })

  describe('getBehavioralAnalytics', () => {
    it('should calculate net score and standing correctly', async () => {
      const mockRecords = [
        { type: 'merit', points: 20 },
        { type: 'demerit', points: 5 },
        { type: 'merit', points: 10 }
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
      } as any)

      const analytics = await ConductService.getBehavioralAnalytics('550e8400-e29b-41d4-a716-446655440000')

      expect(analytics.merits).toBe(30)
      expect(analytics.demerits).toBe(5)
      expect(analytics.netScore).toBe(25)
      expect(analytics.standing).toBe('Good Standings')
    })

    it('should indicate Under Watch if net score is negative', async () => {
      const mockRecords = [
        { type: 'merit', points: 5 },
        { type: 'demerit', points: 15 }
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
      } as any)

      const analytics = await ConductService.getBehavioralAnalytics('550e8400-e29b-41d4-a716-446655440000')
      expect(analytics.standing).toBe('Under Watch')
    })
  })
})
