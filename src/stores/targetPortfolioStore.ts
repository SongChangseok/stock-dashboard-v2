import { create } from 'zustand'
import type { CreateTargetPortfolioData, UpdateTargetPortfolioData } from '../types/targetPortfolio'
import type { TargetPortfolioState } from '../types/store'
import { targetPortfolioService } from '../services'

export const useTargetPortfolioStore = create<TargetPortfolioState>((set) => ({
  targetPortfolios: [],
  selectedTargetPortfolio: null,
  isLoading: false,
  error: null,

  // Fetch target portfolios from database
  fetchTargetPortfolios: async () => {
    set({ isLoading: true, error: null })
    try {
      const portfolios = await targetPortfolioService.getTargetPortfolios()
      set({ targetPortfolios: portfolios, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch target portfolios',
        isLoading: false 
      })
    }
  },

  // Create new target portfolio
  createTargetPortfolio: async (portfolioData: CreateTargetPortfolioData) => {
    set({ isLoading: true, error: null })
    try {
      const newPortfolio = await targetPortfolioService.createTargetPortfolio(portfolioData)
      set((state) => ({
        targetPortfolios: [newPortfolio, ...state.targetPortfolios],
        isLoading: false
      }))
      return newPortfolio
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create target portfolio',
        isLoading: false 
      })
      throw error
    }
  },

  // Update existing target portfolio
  updateTargetPortfolio: async (portfolioData: UpdateTargetPortfolioData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedPortfolio = await targetPortfolioService.updateTargetPortfolio(portfolioData)
      set((state) => ({
        targetPortfolios: state.targetPortfolios.map(p => 
          p.id === updatedPortfolio.id ? updatedPortfolio : p
        ),
        selectedTargetPortfolio: state.selectedTargetPortfolio?.id === updatedPortfolio.id 
          ? updatedPortfolio 
          : state.selectedTargetPortfolio,
        isLoading: false
      }))
      return updatedPortfolio
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update target portfolio',
        isLoading: false 
      })
      throw error
    }
  },

  // Delete target portfolio
  deleteTargetPortfolio: async (portfolioId: string) => {
    set({ isLoading: true, error: null })
    try {
      await targetPortfolioService.deleteTargetPortfolio(portfolioId)
      set((state) => ({
        targetPortfolios: state.targetPortfolios.filter(p => p.id !== portfolioId),
        selectedTargetPortfolio: state.selectedTargetPortfolio?.id === portfolioId 
          ? null 
          : state.selectedTargetPortfolio,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete target portfolio',
        isLoading: false 
      })
      throw error
    }
  },

  setTargetPortfolios: (portfolios) => set({ targetPortfolios: portfolios }),
  setSelectedTargetPortfolio: (portfolio) => set({ selectedTargetPortfolio: portfolio }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null })
}))