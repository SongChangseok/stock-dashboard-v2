// Export all services
export { BaseService } from './baseService'
export { AuthService, authService } from './authService'
export { stockService } from './stockService'
export { targetPortfolioService } from './targetPortfolioService'
export { rebalancingService } from './rebalancingService'
export { errorService, setupGlobalErrorHandler } from './errorService'
export { getCurrentUserId } from './authHelpers'

// Export service types
export type { BaseServiceError, BaseServiceConfig } from './baseService'
export type {
  AuthUser,
  SignUpData,
  SignInData,
  AuthResponse,
} from './authService'
