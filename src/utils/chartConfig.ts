import { ChartData } from '../types/components'

// Chart colors for consistent theming
export const CHART_COLORS = [
  '#6366F1', // Primary indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5A2B', // Brown
  '#6B7280', // Gray
  '#DC2626', // Dark red
  '#059669', // Dark green
  '#7C3AED', // Dark purple
  '#DB2777', // Dark pink
  '#D97706', // Dark orange
] as const

// Chart configuration defaults
export const CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  defaultHeight: 400,
  mobileHeight: 300,
  animation: {
    duration: 350,
    easing: 'ease-in-out',
  },
  tooltip: {
    cursor: { fill: 'rgba(255, 255, 255, 0.1)' },
    contentStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
  legend: {
    wrapperStyle: {
      paddingTop: '20px',
      fontSize: '14px',
    },
  },
} as const

// Generate chart data with consistent colors
export const generateChartData = (
  items: Array<{ name: string; value: number }>,
  total: number
): ChartData[] => {
  return items.map((item, index) => ({
    name: item.name,
    value: item.value,
    percentage: (item.value / total) * 100,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))
}

// Format currency for chart display
export const formatChartCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format percentage for chart display
export const formatChartPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

// Custom label formatter for pie charts
export const renderCustomLabel = (entry: ChartData): string => {
  return `${entry.name}: ${formatChartPercentage(entry.percentage)}`
}

// Chart responsive breakpoints
export const getChartHeight = (isMobile: boolean): number => {
  return isMobile ? CHART_CONFIG.mobileHeight : CHART_CONFIG.defaultHeight
}

// Tooltip formatter for consistent display
export const formatTooltipValue = (value: number, name: string): [string, string] => {
  if (name === 'value') {
    return [formatChartCurrency(value), 'Value']
  }
  if (name === 'percentage') {
    return [formatChartPercentage(value), 'Percentage']
  }
  return [value.toString(), name]
}