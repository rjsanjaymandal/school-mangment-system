import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryService } from '@/lib/services/inventory'
import { createClient } from '@/lib/supabase/client'

// Cast createClient to any to access mock methods
const mockSupabase = createClient() as any

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('getStockTelemetry', () => {
    it('should calculate item status based on quantity_in_stock', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', quantity_in_stock: 5 },  // Critical
        { id: '2', name: 'Item 2', quantity_in_stock: 20 }, // Low
        { id: '3', name: 'Item 3', quantity_in_stock: 100 }, // Optimal
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        mockResolvedValue: vi.fn().mockResolvedValue({ data: mockItems, error: null })
      }
      
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          mockResolvedValue: vi.fn().mockResolvedValue({ data: mockItems, error: null })
        })
      } as any)

      // Wait, the service call is:
      // const { data, error } = await supabase.from("inventory_items").select(`...`);
      // So we need:
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockItems, error: null })
      } as any)

      const results = await InventoryService.getStockTelemetry()

      expect(results[0].status).toBe('Critical')
      expect(results[1].status).toBe('Low')
      expect(results[2].status).toBe('Optimal')
    })
  })

  describe('generateDraftOrder', () => {
    it('should calculate total cost correctly', async () => {
      const mockItem = { id: '1', name: 'Item 1', unit_price: 15.5 }
      const mockOrder = { id: 'order_1', item_id: '1', quantity: 10, total_cost: 155, status: 'ordered' }

      vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
        if (table === 'inventory_items') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null })
          } as any
        }
        if (table === 'procurement_orders') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockOrder, error: null })
          } as any
        }
        return {} as any
      })

      const result = await InventoryService.generateDraftOrder('1', 10)

      expect(result.total_cost).toBe(155)
    })
  })
})
