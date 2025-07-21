// Export all components
export { AuthForm } from './AuthForm'
export { ProtectedRoute } from './ProtectedRoute'
export { StockForm } from './StockForm'
export { StockList } from './StockList'
export { PortfolioSummary } from './PortfolioSummary'
export { FloatingActionButton } from './FloatingActionButton'
export { PortfolioChart } from './PortfolioChart'
export { PortfolioComparison } from './PortfolioComparison'
export { Header } from './Header'
export { TargetPortfolioForm } from './TargetPortfolioForm'
export { TargetPortfolioList } from './TargetPortfolioList'
export { Layout } from './Layout'
export { default as RebalancingCalculator } from './RebalancingCalculator'
export { default as TradingGuide } from './TradingGuide'
export { default as TradingGuideCard } from './TradingGuideCard'
export { default as RebalancingSimulation } from './RebalancingSimulation'
export { ErrorBoundary } from './ErrorBoundary'
export { LoadingIndicator } from './LoadingIndicator'
// SkeletonLoader components are dynamically imported by LazySkeletonLoader
// Remove static export to enable proper code splitting
export {
  LazySkeletonLoader,
  IntersectionLazyLoader,
  AdaptiveSkeletonLoader
} from './LazySkeletonLoader'
export {
  AnimatedLoadingScreen,
  PageLoadingWrapper
} from './AnimatedLoadingScreen'
export { SwipeIndicator, SwipeProgress } from './SwipeIndicator'
