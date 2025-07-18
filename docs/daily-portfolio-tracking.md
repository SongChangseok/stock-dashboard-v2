# Daily Portfolio Tracking Feature

## Overview

This document outlines the implementation plan for adding daily portfolio tracking functionality to the stock dashboard application. The feature will enable users to track their portfolio performance over time by storing daily snapshots and visualizing historical data.

## Current State Analysis

### Existing Portfolio System
- **Real-time calculations**: Portfolio value, cost basis, profit/loss calculated from current stock positions
- **Point-in-time calculations**: Single snapshot calculations based on current price inputs
- **No historical tracking**: All calculations are based on current state only
- **Manual data entry**: All stock prices are manually entered by users

### Current Database Schema
```sql
stocks (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  stock_name: text
  ticker: text (optional)
  quantity: number
  purchase_price: number
  current_price: number
  created_at: timestamp
  updated_at: timestamp
)
```

### Current Limitations
1. **No historical data storage**: Only current stock positions stored
2. **No time-series visualization**: Only pie charts for current allocations
3. **No trend analysis**: No daily/weekly/monthly performance tracking
4. **No historical comparison**: Cannot compare portfolio performance over time

## Feature Requirements

### Core Functionality
1. **Daily Snapshot Storage**: Store daily portfolio values and composition
2. **Historical Data Visualization**: Line charts showing portfolio performance over time
3. **Date Range Selection**: Allow users to select specific time periods for analysis
4. **Performance Metrics**: Calculate daily, weekly, monthly returns
5. **Asset Tracking**: Track individual stock performance over time

### User Interface Requirements
1. **New Dedicated Page**: Create a dedicated "Portfolio History" page for comprehensive analysis
2. **Dashboard Integration**: Add historical tracking section to existing dashboard
3. **Chart Visualization**: Interactive line charts using existing Recharts library
4. **Date Controls**: Date range picker for historical analysis
5. **Mobile Responsive**: Maintain mobile-first design principles
6. **Performance Indicators**: Visual indicators for gains/losses over time
7. **Navigation Integration**: Add navigation link to new Portfolio History page

## Implementation Plan

### Phase 1: Database Schema Extension

#### New Table: `portfolio_snapshots`
```sql
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  profit_loss DECIMAL(15,2) NOT NULL,
  profit_loss_percent DECIMAL(8,4) NOT NULL,
  stock_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, snapshot_date)
);
```

#### New Table: `stock_snapshots`
```sql
CREATE TABLE stock_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_snapshot_id UUID REFERENCES portfolio_snapshots(id) ON DELETE CASCADE,
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
  stock_name TEXT NOT NULL,
  ticker TEXT,
  quantity DECIMAL(15,8) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  weight_percent DECIMAL(8,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes for Performance
```sql
CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date);
CREATE INDEX idx_stock_snapshots_portfolio ON stock_snapshots(portfolio_snapshot_id);
CREATE INDEX idx_stock_snapshots_stock ON stock_snapshots(stock_id);
```

### Phase 2: Service Layer Implementation

#### New Service: `portfolioHistoryService.ts`
```typescript
interface PortfolioSnapshot {
  id: string;
  userId: string;
  snapshotDate: string;
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
  stockCount: number;
  stocks: StockSnapshot[];
}

interface StockSnapshot {
  stockId: string;
  stockName: string;
  ticker?: string;
  quantity: number;
  price: number;
  totalValue: number;
  weightPercent: number;
}

class PortfolioHistoryService {
  // Create daily snapshot
  async createDailySnapshot(userId: string): Promise<PortfolioSnapshot>
  
  // Get historical data
  async getPortfolioHistory(userId: string, startDate: string, endDate: string): Promise<PortfolioSnapshot[]>
  
  // Get performance metrics
  async getPerformanceMetrics(userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<PerformanceMetrics>
}
```

#### Enhanced Types: `types/portfolio.ts`
```typescript
export interface PortfolioSnapshot {
  id: string;
  userId: string;
  snapshotDate: string;
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
  stockCount: number;
  stocks: StockSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestDay: { date: string; return: number };
  worstDay: { date: string; return: number };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
```

### Phase 3: UI Components

#### New Page: `PortfolioHistoryPage.tsx`
```typescript
interface PortfolioHistoryPageProps {}

export const PortfolioHistoryPage: React.FC<PortfolioHistoryPageProps> = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Portfolio History</h1>
        <DateRangeSelector
          startDate={selectedDateRange.startDate}
          endDate={selectedDateRange.endDate}
          onRangeChange={handleDateRangeChange}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chart area */}
        <Card className="lg:col-span-2">
          <PortfolioHistoryChart
            snapshots={portfolioSnapshots}
            dateRange={selectedDateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </Card>
        
        {/* Performance metrics sidebar */}
        <Card>
          <PerformanceMetrics metrics={performanceMetrics} />
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock performance breakdown */}
        <Card>
          <StockPerformanceTable snapshots={portfolioSnapshots} />
        </Card>
        
        {/* Portfolio composition over time */}
        <Card>
          <PortfolioCompositionChart snapshots={portfolioSnapshots} />
        </Card>
      </div>
    </div>
  );
};
```

#### New Component: `PortfolioHistoryChart.tsx`
```typescript
interface PortfolioHistoryChartProps {
  snapshots: PortfolioSnapshot[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({
  snapshots,
  dateRange,
  onDateRangeChange
}) => {
  // Line chart implementation using Recharts
  // Date range selector
  // Performance metrics display
};
```

#### New Component: `DateRangeSelector.tsx`
```typescript
interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  presets?: { label: string; days: number }[];
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onRangeChange,
  presets = DEFAULT_DATE_PRESETS
}) => {
  // Date picker implementation
  // Preset buttons (7D, 30D, 90D, 1Y, All)
  // Mobile-friendly date selection
};
```

#### New Component: `PerformanceMetrics.tsx`
```typescript
interface PerformanceMetricsProps {
  metrics: PerformanceMetrics | null;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  if (!metrics) return <div>No performance data available</div>;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>
      <div className="space-y-3">
        <MetricItem label="Total Return" value={formatPercentage(metrics.totalReturn)} />
        <MetricItem label="Annualized Return" value={formatPercentage(metrics.annualizedReturn)} />
        <MetricItem label="Volatility" value={formatPercentage(metrics.volatility)} />
        <MetricItem label="Sharpe Ratio" value={metrics.sharpeRatio.toFixed(2)} />
        <MetricItem label="Max Drawdown" value={formatPercentage(metrics.maxDrawdown)} />
      </div>
    </div>
  );
};
```

#### New Component: `StockPerformanceTable.tsx`
```typescript
interface StockPerformanceTableProps {
  snapshots: PortfolioSnapshot[];
}

export const StockPerformanceTable: React.FC<StockPerformanceTableProps> = ({ snapshots }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Stock Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Stock</th>
              <th className="text-right p-2">Return</th>
              <th className="text-right p-2">Volatility</th>
            </tr>
          </thead>
          <tbody>
            {/* Stock performance rows */}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

#### Enhanced Component: `Header.tsx`
```typescript
// Add Portfolio History navigation item
const navigationItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/target-portfolio', label: 'Target Portfolio' },
  { path: '/portfolio-comparison', label: 'Analytics' },
  { path: '/portfolio-history', label: 'History' }, // New navigation item
];
```

#### Enhanced Component: `DashboardPage.tsx`
```typescript
// Add historical tracking section with link to full page
const HistoricalTrackingSection = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">Portfolio Performance</h2>
      <Link 
        to="/portfolio-history" 
        className="text-indigo-500 hover:text-indigo-400 text-sm font-medium"
      >
        View Full History →
      </Link>
    </div>
    <PortfolioHistoryChart 
      snapshots={portfolioSnapshots.slice(-30)} // Show last 30 days
      dateRange={last30DaysRange}
      onDateRangeChange={setSelectedDateRange}
      compact={true} // Compact version for dashboard
    />
  </Card>
);
```

### Phase 4: State Management

#### Enhanced Store: `portfolioStore.ts`
```typescript
interface PortfolioState {
  // Existing state...
  portfolioSnapshots: PortfolioSnapshot[];
  selectedDateRange: DateRange;
  performanceMetrics: PerformanceMetrics | null;
  isLoadingHistory: boolean;
  
  // New actions
  loadPortfolioHistory: (startDate: string, endDate: string) => Promise<void>;
  createDailySnapshot: () => Promise<void>;
  setDateRange: (range: DateRange) => void;
  calculatePerformanceMetrics: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>;
}
```

### Phase 5: Utilities and Helpers

#### New Utility: `utils/dateUtils.ts`
```typescript
export const DATE_PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '1 Year', days: 365 },
  { label: 'All Time', days: -1 }
];

export const formatDateForChart = (date: string): string => {
  // Format date for chart display
};

export const calculateDateRange = (days: number): DateRange => {
  // Calculate date range from days
};
```

#### Enhanced Utility: `utils/calculations.ts`
```typescript
export const calculatePerformanceMetrics = (
  snapshots: PortfolioSnapshot[]
): PerformanceMetrics => {
  // Calculate performance metrics from snapshots
};

export const calculateVolatility = (returns: number[]): number => {
  // Calculate portfolio volatility
};

export const calculateSharpeRatio = (returns: number[], riskFreeRate: number = 0.02): number => {
  // Calculate Sharpe ratio
};
```

## Database Migration

### Migration Script: `supabase/migrations/add_portfolio_tracking.sql`
```sql
-- Add portfolio_snapshots table
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  profit_loss DECIMAL(15,2) NOT NULL,
  profit_loss_percent DECIMAL(8,4) NOT NULL,
  stock_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, snapshot_date)
);

-- Add stock_snapshots table
CREATE TABLE stock_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_snapshot_id UUID REFERENCES portfolio_snapshots(id) ON DELETE CASCADE,
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
  stock_name TEXT NOT NULL,
  ticker TEXT,
  quantity DECIMAL(15,8) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  weight_percent DECIMAL(8,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date);
CREATE INDEX idx_stock_snapshots_portfolio ON stock_snapshots(portfolio_snapshot_id);
CREATE INDEX idx_stock_snapshots_stock ON stock_snapshots(stock_id);

-- Add RLS policies
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolio snapshots" ON portfolio_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio snapshots" ON portfolio_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stock snapshots" ON stock_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolio_snapshots 
      WHERE portfolio_snapshots.id = stock_snapshots.portfolio_snapshot_id 
      AND portfolio_snapshots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own stock snapshots" ON stock_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_snapshots 
      WHERE portfolio_snapshots.id = stock_snapshots.portfolio_snapshot_id 
      AND portfolio_snapshots.user_id = auth.uid()
    )
  );
```

## Testing Strategy

### Unit Tests
- `portfolioHistoryService.test.ts`: Service layer testing
- `dateUtils.test.ts`: Date utility function testing
- `calculations.test.ts`: Performance metric calculations

### Integration Tests
- `PortfolioHistoryPage.test.tsx`: Full page integration testing
- `PortfolioHistoryChart.test.tsx`: Chart component testing
- `DateRangeSelector.test.tsx`: Date selector testing
- `DashboardIntegration.test.tsx`: Dashboard integration testing
- `NavigationIntegration.test.tsx`: Portfolio History page navigation testing

### E2E Tests
- Daily snapshot creation workflow
- Historical data visualization
- Date range selection functionality
- Performance metrics calculation
- Portfolio History page navigation and functionality
- Cross-page navigation between Dashboard and Portfolio History

## Deployment Considerations

### Database Migration
1. Run migration script in staging environment
2. Test data integrity and performance
3. Create backup before production deployment
4. Monitor query performance post-deployment

### Performance Optimization
1. Add database indexes for efficient queries
2. Implement data pagination for large date ranges
3. Add caching for frequently accessed historical data
4. Consider data archiving for very old snapshots

### User Experience
1. Progressive loading for large datasets
2. Skeleton loaders for chart components
3. Error handling for missing historical data
4. Mobile-optimized touch interactions

## Future Enhancements

### Advanced Analytics
1. Portfolio comparison against market benchmarks
2. Risk-adjusted performance metrics
3. Correlation analysis between assets
4. Monte Carlo simulations for future projections

### Data Export
1. CSV export of historical data
2. PDF reports with charts and metrics
3. Integration with external portfolio tracking tools
4. API endpoints for third-party integrations

### Automation
1. Automated daily snapshot creation
2. Email alerts for significant portfolio changes
3. Scheduled performance reports
4. Integration with external price data sources

## Conclusion

This implementation plan provides a comprehensive approach to adding daily portfolio tracking functionality while maintaining the existing manual data entry approach. The solution leverages the current tech stack (React, TypeScript, Supabase, Recharts) and follows established patterns in the codebase.

The phased approach allows for incremental development and testing, ensuring minimal disruption to existing functionality while adding powerful new capabilities for portfolio analysis and tracking.