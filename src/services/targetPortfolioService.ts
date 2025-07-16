import { BaseService } from './baseService'
import { authService } from './authService'
import type {
  TargetPortfolioData,
  CreateTargetPortfolioData,
  UpdateTargetPortfolioData,
  TargetPortfolioAllocations,
} from '../types/targetPortfolio'
import type { TargetPortfolio, JsonValue } from '../types/database'

class TargetPortfolioService extends BaseService<
  TargetPortfolioData,
  CreateTargetPortfolioData,
  UpdateTargetPortfolioData
> {
  constructor() {
    super({
      tableName: 'target_portfolios',
      userIdField: 'user_id',
      requiredFields: ['name', 'allocations'],
    })
  }

  // Convenience methods that maintain backward compatibility
  async getTargetPortfolios(): Promise<TargetPortfolioData[]> {
    return this.getAll()
  }

  async createTargetPortfolio(
    portfolioData: CreateTargetPortfolioData,
  ): Promise<TargetPortfolioData> {
    return this.create(portfolioData)
  }

  async updateTargetPortfolio(
    portfolioData: UpdateTargetPortfolioData,
  ): Promise<TargetPortfolioData> {
    return this.update(portfolioData)
  }

  async deleteTargetPortfolio(portfolioId: string): Promise<void> {
    return this.delete(portfolioId)
  }

  async getTargetPortfolio(
    portfolioId: string,
  ): Promise<TargetPortfolioData | null> {
    return this.getById(portfolioId)
  }

  /**
   * Search target portfolios by name
   */
  async searchTargetPortfolios(query: string): Promise<TargetPortfolioData[]> {
    try {
      const userId = await authService.getCurrentUserId()

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        throw this.createError(`Failed to search target portfolios`, error)
      }

      return this.transformFromDatabase(data || [])
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(
        `Unexpected error searching target portfolios`,
        error,
      )
    }
  }

  /**
   * Transform database records to domain objects
   */
  protected transformFromDatabase(data: unknown[]): TargetPortfolioData[] {
    return (data as TargetPortfolio[]).map(this.transformFromDatabaseRow)
  }

  /**
   * Transform single database row to domain object
   */
  private transformFromDatabaseRow(
    dbRow: TargetPortfolio,
  ): TargetPortfolioData {
    const allocations =
      dbRow.allocations as unknown as TargetPortfolioAllocations

    return {
      id: dbRow.id,
      name: dbRow.name,
      allocations,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      user_id: dbRow.user_id,
    }
  }

  /**
   * Prepare data for database insertion/update
   */
  protected prepareForDatabase(data: unknown): unknown {
    const portfolio = data as
      | CreateTargetPortfolioData
      | UpdateTargetPortfolioData

    const result: Record<string, unknown> = {}

    if ('name' in portfolio) {
      result.name = portfolio.name
    }

    if ('allocations' in portfolio) {
      result.allocations = portfolio.allocations as unknown as JsonValue
    }

    return result
  }


  // Helper method to validate portfolio allocations
  validateAllocations(allocations: TargetPortfolioAllocations): import('../types/base').BaseValidationResult {
    const errors: string[] = []

    if (!allocations.stocks || allocations.stocks.length === 0) {
      errors.push('At least one stock allocation is required')
    }

    const totalWeight = allocations.stocks.reduce(
      (sum, stock) => sum + stock.target_weight,
      0,
    )

    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push(
        `Total allocation must equal 100%, current total: ${totalWeight.toFixed(2)}%`,
      )
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
      errors,
    }
  }
}

export const targetPortfolioService = new TargetPortfolioService()
