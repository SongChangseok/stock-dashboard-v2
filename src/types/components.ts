import { Stock, StockWithValue, PortfolioSummary } from './database'
import { TargetPortfolioData } from './targetPortfolio'

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

export interface ChartData {
  name: string
  value: number
  percentage: number
  color: string
}

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