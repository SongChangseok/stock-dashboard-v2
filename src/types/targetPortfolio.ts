// Target Portfolio Types

export interface TargetPortfolioStock {
  stock_name: string
  ticker?: string
  target_weight: number // Percentage (0-100)
}

export interface TargetPortfolioAllocations {
  description?: string
  stocks: TargetPortfolioStock[]
  total_weight: number // Should equal 100
  [key: string]: unknown // Index signature for Json compatibility
}

export interface TargetPortfolioData {
  id: string
  name: string
  allocations: TargetPortfolioAllocations
  created_at: string
  updated_at: string
  user_id: string
}

// Database interaction types
export type CreateTargetPortfolioData = {
  name: string
  allocations: TargetPortfolioAllocations
}

export type UpdateTargetPortfolioData = {
  id: string
  name?: string
  allocations?: TargetPortfolioAllocations
}


// UI Component Types
export interface TargetPortfolioFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editPortfolio?: TargetPortfolioData | null
}

export interface TargetPortfolioListProps {
  portfolios: TargetPortfolioData[]
  onEdit: (portfolio: TargetPortfolioData) => void
  onDelete: (portfolioId: string) => void
  onAdd: () => void
  onDuplicate?: (portfolio: TargetPortfolioData) => void
}

export interface WeightInputProps {
  stock: TargetPortfolioStock
  onChange: (stockId: string, weight: number) => void
  disabled?: boolean
}

export interface PortfolioWeightSliderProps {
  stocks: TargetPortfolioStock[]
  onChange: (stocks: TargetPortfolioStock[]) => void
  totalWeight: number
}

// Validation Types
export interface PortfolioValidationResult {
  isValid: boolean
  errors: string[]
  totalWeight: number
}

// Portfolio Comparison Types
export interface TargetPortfolioComparison {
  target_portfolio: TargetPortfolioData
  current_allocation: {
    stock_name: string
    ticker?: string
    current_weight: number
    target_weight: number
    difference: number
  }[]
  total_difference: number
}