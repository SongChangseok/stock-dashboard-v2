import React, { useState } from 'react'
import { TargetPortfolioList, TargetPortfolioForm } from '../components'
import type { TargetPortfolioData } from '../types'

export const TargetPortfolioPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<TargetPortfolioData[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<TargetPortfolioData | null>(null)

  const handleAddPortfolio = () => {
    setEditingPortfolio(null)
    setIsFormOpen(true)
  }

  const handleEditPortfolio = (portfolio: TargetPortfolioData) => {
    setEditingPortfolio(portfolio)
    setIsFormOpen(true)
  }

  const handleDeletePortfolio = (portfolioId: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== portfolioId))
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingPortfolio(null)
  }

  const handleSavePortfolio = () => {
    // TODO: Implement actual save logic
    console.log('Portfolio saved')
  }

  return (
    <>
      {/* Page Title - Desktop Only */}
      <div className="hidden md:block mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Target Portfolio</h1>
        <p className="text-gray-400">Set your ideal portfolio allocation and target weights</p>
      </div>

      {/* Target Portfolio Content */}
      <div className="space-y-4 md:space-y-8">
        <TargetPortfolioList
          portfolios={portfolios}
          onEdit={handleEditPortfolio}
          onDelete={handleDeletePortfolio}
          onAdd={handleAddPortfolio}
        />
      </div>

      {/* Target Portfolio Form Modal */}
      <TargetPortfolioForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSavePortfolio}
        editPortfolio={editingPortfolio}
      />
    </>
  )
}