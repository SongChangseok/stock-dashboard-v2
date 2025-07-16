import { Stock, StockWithValue, PortfolioSummary } from './database'
import { TargetPortfolioData } from './targetPortfolio'
import { RebalancingCalculation } from './rebalancing'

// Auth component types
export interface AuthFormProps {
  type: 'login' | 'signup'
  onSuccess?: () => void
}

// Layout component types
export interface ProtectedRouteProps {
  children: React.ReactNode
}

export interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
}

// Portfolio component types
export interface PortfolioSummaryProps {
  summary: PortfolioSummary
}

export interface PortfolioChartProps {
  summary: PortfolioSummary
}

export interface PortfolioComparisonProps {
  currentPortfolio: PortfolioSummary
  targetPortfolio: TargetPortfolioData | null
}

export interface ComparisonData {
  name: string
  current: number
  target: number
  difference: number
  isOverweight: boolean
  color: string
}

export interface ComparisonTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ComparisonData & { percentage: number } }>
  label?: string | number
  type: 'current' | 'target'
}

// Re-export from base types for backward compatibility
export type { ChartData } from './base'

// Stock component types
export interface StockFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editStock?: Stock | null
}

export interface StockListProps {
  stocks: StockWithValue[]
  onEdit: (stock: StockWithValue) => void
  onDelete: (stockId: string) => void
  onAdd: () => void
}

// Form types
export interface FormErrors {
  [key: string]: string
}

export interface FormData {
  [key: string]: string | number
}

// Navigation types
export interface TabItem {
  id: string
  label: string
  route?: string
  icon: React.ReactNode
}

export interface HeaderProps {
  user: { email?: string } | null
  onSignOut: () => Promise<void>
}

export interface NavItem {
  id: string
  label: string
  route?: string
}

// Trading Guide component types
export interface TradingGuideCardProps {
  calculation: RebalancingCalculation
  commission: number
}

export interface TradingGuideProps {
  currentPortfolio: PortfolioSummary
  targetPortfolio: TargetPortfolioData
  calculations: RebalancingCalculation[]
  commission: number
}

// Rebalancing Simulation component types
// Use BaseChartData for consistency
export type { BaseChartData as RebalancingSimulationChartData } from './base'

export interface RebalancingSimulationProps {
  currentPortfolio: PortfolioSummary
  targetPortfolio: TargetPortfolioData
  calculations: RebalancingCalculation[]
}

// Skeleton Loader component types
export interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  className?: string
}

export interface StockListSkeletonProps {
  count?: number
}

export interface PortfolioChartSkeletonProps {
  showLegend?: boolean
}

export interface TargetPortfolioListSkeletonProps {
  count?: number
}

export interface FormSkeletonProps {
  fields?: number
  hasSubmitButton?: boolean
}

export interface SummaryCardSkeletonProps {
  count?: number
}

// Base Chart component types
export interface BaseChartProps {
  data: import('./base').ChartData[]
  title?: string
  height?: number
  showLegend?: boolean
  className?: string
}

// Action Button Group component types
export interface ActionButtonGroupProps {
  onEdit: () => void
  onDelete: () => void
  onCompare?: () => void
  isLoading?: boolean
  deleteText?: string
  editText?: string
  compareText?: string
}

// List Container component types
export interface ListContainerProps<T = unknown> {
  title: string
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
  className?: string
}

// Loading Button component types
export interface LoadingButtonProps {
  isLoading: boolean
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

// Empty State component types
export interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

// Card component types
export interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
}

// Form Field component types
export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select'
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string | number; label: string }>
  className?: string
}