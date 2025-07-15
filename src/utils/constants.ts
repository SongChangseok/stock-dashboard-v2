/**
 * Centralized constants for business rules and UI configuration
 * Provides consistent values across the application
 */

/**
 * Business rule constants
 * These values define core business logic and calculation parameters
 */
export const BUSINESS_RULES = {
  /** Default rebalancing threshold percentage (5.0%) */
  REBALANCE_THRESHOLD: 5.0,
  
  /** Daily change simulation rate for portfolio display (0.67%) */
  DAILY_CHANGE_SIMULATION: 0.67,
  
  /** Minimum trading unit for stock transactions */
  MIN_TRADING_UNIT: 1,
  
  /** Default commission per trade */
  DEFAULT_COMMISSION: 0,
  
  /** Commission cost threshold as percentage of trade value (10%) */
  COMMISSION_THRESHOLD: 0.1,
  
  /** Maximum weight percentage for any single stock */
  MAX_STOCK_WEIGHT: 100,
  
  /** Minimum weight percentage for portfolio allocation */
  MIN_STOCK_WEIGHT: 0,
  
  /** Default portfolio total weight percentage */
  TOTAL_PORTFOLIO_WEIGHT: 100,
} as const

/**
 * UI configuration constants
 * These values control user interface behavior and styling
 */
export const UI_CONFIG = {
  /** Fast animation duration in milliseconds */
  ANIMATION_FAST: 150,
  
  /** Standard animation duration in milliseconds */
  ANIMATION_STANDARD: 350,
  
  /** Slow animation duration in milliseconds */
  ANIMATION_SLOW: 650,
  
  /** Minimum touch target size in pixels for mobile accessibility */
  MIN_TOUCH_TARGET: 44,
  
  /** Debounce delay for search inputs in milliseconds */
  DEBOUNCE_DELAY: 300,
  
  /** Maximum number of items to display in lists before pagination */
  MAX_LIST_ITEMS: 50,
  
  /** Default decimal places for percentage display */
  PERCENTAGE_DECIMALS: 2,
  
  /** Default decimal places for currency display */
  CURRENCY_DECIMALS: 2,
} as const

/**
 * Formatting configuration constants
 * These values control number and currency formatting
 */
export const FORMAT_CONFIG = {
  /** Default locale for formatting */
  DEFAULT_LOCALE: 'en-US',
  
  /** Default currency code */
  DEFAULT_CURRENCY: 'USD',
  
  /** Compact number formatting threshold */
  COMPACT_NUMBER_THRESHOLD: 1000,
  
  /** Maximum decimal places for large numbers */
  MAX_DECIMAL_PLACES: 4,
} as const

/**
 * API and service configuration constants
 */
export const SERVICE_CONFIG = {
  /** Request timeout in milliseconds */
  REQUEST_TIMEOUT: 30000,
  
  /** Retry attempts for failed requests */
  MAX_RETRY_ATTEMPTS: 3,
  
  /** Cache duration in milliseconds */
  CACHE_DURATION: 300000, // 5 minutes
  
  /** Batch size for bulk operations */
  BATCH_SIZE: 20,
} as const

/**
 * Validation constants
 * These values define validation rules and limits
 */
export const VALIDATION_RULES = {
  /** Minimum stock quantity */
  MIN_QUANTITY: 0.01,
  
  /** Maximum stock quantity */
  MAX_QUANTITY: 999999,
  
  /** Minimum stock price */
  MIN_PRICE: 0.01,
  
  /** Maximum stock price */
  MAX_PRICE: 999999,
  
  /** Maximum portfolio name length */
  MAX_PORTFOLIO_NAME_LENGTH: 100,
  
  /** Maximum stock name length */
  MAX_STOCK_NAME_LENGTH: 50,
  
  /** Maximum ticker symbol length */
  MAX_TICKER_LENGTH: 10,
  
  /** Minimum portfolio name length */
  MIN_PORTFOLIO_NAME_LENGTH: 1,
} as const

/**
 * Responsive breakpoints (matching Tailwind CSS)
 */
export const BREAKPOINTS = {
  /** Mobile devices */
  MOBILE: 375,
  
  /** Small tablets */
  SM: 640,
  
  /** Tablets */
  MD: 768,
  
  /** Small laptops */
  LG: 1024,
  
  /** Desktops */
  XL: 1280,
  
  /** Large desktops */
  XXL: 1536,
} as const

/**
 * Color scheme constants for charts and indicators
 */
export const COLORS = {
  /** Success/positive change color */
  SUCCESS: '#10B981',
  
  /** Error/negative change color */
  ERROR: '#EF4444',
  
  /** Warning color */
  WARNING: '#F59E0B',
  
  /** Primary brand color */
  PRIMARY: '#6366F1',
  
  /** Secondary color */
  SECONDARY: '#8B5CF6',
  
  /** Neutral color */
  NEUTRAL: '#6B7280',
} as const

/**
 * Chart configuration constants
 */
export const CHART_CONFIG = {
  /** Default chart height in pixels */
  DEFAULT_HEIGHT: 300,
  
  /** Mobile chart height in pixels */
  MOBILE_HEIGHT: 200,
  
  /** Maximum number of data points to display */
  MAX_DATA_POINTS: 100,
  
  /** Animation duration for chart transitions */
  ANIMATION_DURATION: 300,
} as const