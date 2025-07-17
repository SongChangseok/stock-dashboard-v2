// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { targetPortfolioService } from '../targetPortfolioService'
import { authService } from '../authService'
import type { CreateTargetPortfolioData, UpdateTargetPortfolioData, TargetPortfolioAllocations } from '../../types/targetPortfolio'

// Mock Supabase and dependencies
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null
            })),
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          })),
          order: vi.fn(() => ({
            data: [],
            error: null
          })),
          ilike: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: null
              }))
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: null
          }))
        }))
      }))
    }))
  }
}))

vi.mock('../authService', () => ({
  authService: {
    getCurrentUserId: vi.fn()
  }
}))

describe('TargetPortfolioService', () => {
  const mockUserId = 'test-user-123'
  const mockAllocations: TargetPortfolioAllocations = {
    description: 'Balanced portfolio',
    stocks: [
      { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 60 },
      { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 40 }
    ],
    total_weight: 100
  }

  const mockTargetPortfolio = {
    id: 'portfolio-1',
    name: 'My Portfolio',
    allocations: mockAllocations,
    user_id: mockUserId,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.getCurrentUserId).mockResolvedValue(mockUserId)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should get all target portfolios for authenticated user', async () => {
      const mockSupabaseQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [mockTargetPortfolio],
              error: null
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      const result = await targetPortfolioService.getTargetPortfolios()

      expect(result).toEqual([mockTargetPortfolio])
      expect(supabase.from).toHaveBeenCalledWith('target_portfolios')
      expect(authService.getCurrentUserId).toHaveBeenCalled()
    })

    it('should create a new target portfolio', async () => {
      const createData: CreateTargetPortfolioData = {
        name: 'My Portfolio',
        allocations: mockAllocations
      }

      const mockSupabaseQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockTargetPortfolio,
              error: null
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      const result = await targetPortfolioService.createTargetPortfolio(createData)

      expect(result).toEqual(mockTargetPortfolio)
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        name: 'My Portfolio',
        allocations: mockAllocations,
        user_id: mockUserId
      })
    })

    it('should update an existing target portfolio', async () => {
      const updateData: UpdateTargetPortfolioData = {
        id: 'portfolio-1',
        name: 'Updated Portfolio'
      }

      const updatedPortfolio = { ...mockTargetPortfolio, name: 'Updated Portfolio' }

      const mockSupabaseQuery = {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: updatedPortfolio,
                  error: null
                }))
              }))
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      const result = await targetPortfolioService.updateTargetPortfolio(updateData)

      expect(result).toEqual(updatedPortfolio)
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({ name: 'Updated Portfolio' })
    })

    it('should delete a target portfolio by id', async () => {
      const mockSupabaseQuery = {
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: null
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      await targetPortfolioService.deleteTargetPortfolio('portfolio-1')

      expect(mockSupabaseQuery.delete).toHaveBeenCalled()
    })

    it('should get target portfolio by id', async () => {
      const mockSupabaseQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockTargetPortfolio,
                error: null
              }))
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      const result = await targetPortfolioService.getTargetPortfolio('portfolio-1')

      expect(result).toEqual(mockTargetPortfolio)
    })

    it('should return null when target portfolio not found', async () => {
      const mockSupabaseQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'PGRST116' }
              }))
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      const result = await targetPortfolioService.getTargetPortfolio('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('Search Operations', () => {
    it('should search target portfolios by name', async () => {
      const mockSupabaseQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            ilike: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [mockTargetPortfolio],
                error: null
              }))
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      const result = await targetPortfolioService.searchTargetPortfolios('My')

      expect(result).toEqual([mockTargetPortfolio])
    })
  })

  describe('Data Transformation', () => {
    it('should transform database row to domain object', async () => {
      const dbRow = {
        id: 'portfolio-1',
        name: 'My Portfolio',
        allocations: mockAllocations,
        user_id: mockUserId,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockSupabaseQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [dbRow],
              error: null
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      const result = await targetPortfolioService.getTargetPortfolios()

      expect(result[0]).toEqual({
        id: 'portfolio-1',
        name: 'My Portfolio',
        allocations: mockAllocations,
        user_id: mockUserId,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      })
    })
  })

  describe('Allocation Validation', () => {
    it('should validate correct allocations', () => {
      const validAllocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 60 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 40 }
        ],
        total_weight: 100
      }

      const result = targetPortfolioService.validateAllocations(validAllocations)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty stocks array', () => {
      const invalidAllocations: TargetPortfolioAllocations = {
        stocks: [],
        total_weight: 0
      }

      const result = targetPortfolioService.validateAllocations(invalidAllocations)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one stock allocation is required')
    })

    it('should reject incorrect total weight', () => {
      const invalidAllocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 60 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 30 }
        ],
        total_weight: 90
      }

      const result = targetPortfolioService.validateAllocations(invalidAllocations)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Total allocation must equal 100%, current total: 90.00%')
    })

    it('should reject empty stock names', () => {
      const invalidAllocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: '', ticker: 'AAPL', target_weight: 60 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 40 }
        ],
        total_weight: 100
      }

      const result = targetPortfolioService.validateAllocations(invalidAllocations)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Stock 1: Name is required')
    })

    it('should reject zero or negative weights', () => {
      const invalidAllocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 0 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 100 }
        ],
        total_weight: 100
      }

      const result = targetPortfolioService.validateAllocations(invalidAllocations)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Stock 1: Weight must be greater than 0')
    })

    it('should reject weights over 100%', () => {
      const invalidAllocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 150 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: -50 }
        ],
        total_weight: 100
      }

      const result = targetPortfolioService.validateAllocations(invalidAllocations)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Stock 1: Weight cannot exceed 100%')
      expect(result.errors).toContain('Stock 2: Weight must be greater than 0')
    })

    it('should collect multiple validation errors', () => {
      const invalidAllocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: '', ticker: 'AAPL', target_weight: -10 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 150 }
        ],
        total_weight: 140
      }

      const result = targetPortfolioService.validateAllocations(invalidAllocations)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(4)
      expect(result.errors).toContain('Stock 1: Name is required')
      expect(result.errors).toContain('Stock 1: Weight must be greater than 0')
      expect(result.errors).toContain('Stock 2: Weight cannot exceed 100%')
      expect(result.errors).toContain('Total allocation must equal 100%, current total: 140.00%')
    })

    it('should handle small floating point differences in total weight', () => {
      const validAllocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 33.33 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 33.33 },
          { stock_name: 'Google Inc.', ticker: 'GOOGL', target_weight: 33.34 }
        ],
        total_weight: 100
      }

      const result = targetPortfolioService.validateAllocations(validAllocations)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors during getTargetPortfolios', async () => {
      const mockSupabaseQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      await expect(targetPortfolioService.getTargetPortfolios()).rejects.toThrow()
    })

    it('should handle authentication errors', async () => {
      vi.mocked(authService.getCurrentUserId).mockRejectedValue(new Error('User not authenticated'))

      await expect(targetPortfolioService.getTargetPortfolios()).rejects.toThrow('User not authenticated')
    })

    it('should handle database errors during create', async () => {
      const createData: CreateTargetPortfolioData = {
        name: 'My Portfolio',
        allocations: mockAllocations
      }

      const mockSupabaseQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: 'Insert failed' }
            }))
          }))
        }))
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any)

      await expect(targetPortfolioService.createTargetPortfolio(createData)).rejects.toThrow()
    })

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(authService.getCurrentUserId).mockRejectedValue('Unexpected error')

      await expect(targetPortfolioService.getTargetPortfolios()).rejects.toThrow('Unexpected error fetching target_portfolios')
    })
  })
})