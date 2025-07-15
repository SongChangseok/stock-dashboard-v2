import { supabase } from './supabase'
import { getCurrentUserId } from './authHelpers'
import type { 
  TargetPortfolioData, 
  CreateTargetPortfolioData, 
  UpdateTargetPortfolioData,
  TargetPortfolioAllocations 
} from '../types/targetPortfolio'
import type { TargetPortfolio, JsonValue } from '../types/database'

class TargetPortfolioService {
  async getTargetPortfolios(): Promise<TargetPortfolioData[]> {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('target_portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch target portfolios: ${error.message}`)
    }

    // Transform database rows to our domain type
    return (data || []).map(this.transformFromDatabase)
  }

  async createTargetPortfolio(portfolioData: CreateTargetPortfolioData): Promise<TargetPortfolioData> {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('target_portfolios')
      .insert({
        name: portfolioData.name,
        allocations: portfolioData.allocations as unknown as JsonValue,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create target portfolio: ${error.message}`)
    }

    return this.transformFromDatabase(data)
  }

  async updateTargetPortfolio(portfolioData: UpdateTargetPortfolioData): Promise<TargetPortfolioData> {
    const userId = await getCurrentUserId()

    const updateData: Record<string, JsonValue | string> = {}
    if (portfolioData.name) updateData.name = portfolioData.name
    if (portfolioData.allocations) updateData.allocations = portfolioData.allocations as unknown as JsonValue

    const { data, error } = await supabase
      .from('target_portfolios')
      .update(updateData)
      .eq('id', portfolioData.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update target portfolio: ${error.message}`)
    }

    return this.transformFromDatabase(data)
  }

  async deleteTargetPortfolio(portfolioId: string): Promise<void> {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('target_portfolios')
      .delete()
      .eq('id', portfolioId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete target portfolio: ${error.message}`)
    }
  }

  async getTargetPortfolio(portfolioId: string): Promise<TargetPortfolioData | null> {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('target_portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch target portfolio: ${error.message}`)
    }

    return this.transformFromDatabase(data)
  }

  private transformFromDatabase(dbRow: TargetPortfolio): TargetPortfolioData {
    const allocations = dbRow.allocations as unknown as TargetPortfolioAllocations
    
    return {
      id: dbRow.id,
      name: dbRow.name,
      allocations,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      user_id: dbRow.user_id
    }
  }

  // Helper method to validate portfolio allocations
  validateAllocations(allocations: TargetPortfolioAllocations): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!allocations.stocks || allocations.stocks.length === 0) {
      errors.push('At least one stock allocation is required')
    }
    
    const totalWeight = allocations.stocks.reduce((sum, stock) => sum + stock.target_weight, 0)
    
    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push(`Total allocation must equal 100%, current total: ${totalWeight.toFixed(2)}%`)
    }

    allocations.stocks.forEach((stock, index) => {
      if (!stock.stock_name.trim()) {
        errors.push(`Stock ${index + 1}: Name is required`)
      }
      if (stock.target_weight <= 0) {
        errors.push(`Stock ${index + 1}: Weight must be greater than 0`)
      }
      if (stock.target_weight > 100) {
        errors.push(`Stock ${index + 1}: Weight cannot exceed 100%`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export const targetPortfolioService = new TargetPortfolioService()