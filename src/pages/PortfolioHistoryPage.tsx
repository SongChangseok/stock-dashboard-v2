import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'

/**
 * Portfolio History Page - Currently Disabled
 * 
 * This page is temporarily disabled because the required database schema
 * and portfolio history service have not been implemented yet.
 */
export default function PortfolioHistoryPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8">
          <EmptyState
            title="Portfolio History Feature Coming Soon"
            description="This feature is currently under development. The portfolio history tracking functionality will be available once the database schema is implemented."
            actionLabel="Go Back to Dashboard"
            onAction={() => window.history.back()}
          />
        </Card>
      </div>
    </div>
  )
}