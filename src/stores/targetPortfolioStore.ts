import { create } from 'zustand'
import type { CreateTargetPortfolioData, UpdateTargetPortfolioData, TargetPortfolioData, TargetPortfolioAllocations } from '../types/targetPortfolio'
import type { TargetPortfolioState } from '../types/store'
import { targetPortfolioService } from '../services'
import { realtimeService } from '../services/realtimeService'
import { saveToSession, loadFromSession, SESSION_KEYS } from '../utils/sessionStorage'

export const useTargetPortfolioStore = create<TargetPortfolioState>((set, get) => ({
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
    const tempId = `temp_${Date.now()}`
    
    // Optimistic update - add portfolio immediately with temporary ID
    const optimisticPortfolio = {
      id: tempId,
      user_id: 'temp_user', // Will be replaced with real data
      name: portfolioData.name,
      allocations: portfolioData.allocations,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    set((state) => ({
      targetPortfolios: [optimisticPortfolio, ...state.targetPortfolios],
      isLoading: true,
      error: null
    }))
    
    try {
      const newPortfolio = await targetPortfolioService.createTargetPortfolio(portfolioData)
      // Replace optimistic portfolio with real one
      set((state) => ({
        targetPortfolios: state.targetPortfolios.map(p => 
          p.id === tempId ? newPortfolio : p
        ),
        isLoading: false
      }))
      return newPortfolio
    } catch (error) {
      // Revert optimistic update on error
      set((state) => ({
        targetPortfolios: state.targetPortfolios.filter(p => p.id !== tempId),
        error: error instanceof Error ? error.message : 'Failed to create target portfolio',
        isLoading: false 
      }))
      throw error
    }
  },

  // Update existing target portfolio
  updateTargetPortfolio: async (portfolioData: UpdateTargetPortfolioData) => {
    const originalPortfolios = get().targetPortfolios
    const originalSelected = get().selectedTargetPortfolio
    
    // Optimistic update - update portfolio immediately
    const optimisticPortfolio = {
      ...originalPortfolios.find(p => p.id === portfolioData.id)!,
      ...portfolioData,
      updated_at: new Date().toISOString()
    }
    
    set((state) => ({
      targetPortfolios: state.targetPortfolios.map(p => 
        p.id === portfolioData.id ? optimisticPortfolio : p
      ),
      selectedTargetPortfolio: state.selectedTargetPortfolio?.id === portfolioData.id 
        ? optimisticPortfolio 
        : state.selectedTargetPortfolio,
      isLoading: true,
      error: null
    }))
    
    try {
      const updatedPortfolio = await targetPortfolioService.updateTargetPortfolio(portfolioData)
      // Replace optimistic update with real data
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
      // Revert optimistic update on error
      set({ 
        targetPortfolios: originalPortfolios,
        selectedTargetPortfolio: originalSelected,
        error: error instanceof Error ? error.message : 'Failed to update target portfolio',
        isLoading: false 
      })
      throw error
    }
  },

  // Delete target portfolio
  deleteTargetPortfolio: async (portfolioId: string) => {
    const originalPortfolios = get().targetPortfolios
    const originalSelected = get().selectedTargetPortfolio
    
    // Optimistic update - remove portfolio immediately
    set((state) => ({
      targetPortfolios: state.targetPortfolios.filter(p => p.id !== portfolioId),
      selectedTargetPortfolio: state.selectedTargetPortfolio?.id === portfolioId 
        ? null 
        : state.selectedTargetPortfolio,
      isLoading: true,
      error: null
    }))
    
    try {
      await targetPortfolioService.deleteTargetPortfolio(portfolioId)
      // Success - optimistic update is correct
      set({ isLoading: false })
    } catch (error) {
      // Revert optimistic update on error
      set({ 
        targetPortfolios: originalPortfolios,
        selectedTargetPortfolio: originalSelected,
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
  clearError: () => set({ error: null }),

  // Real-time subscription management
  subscribeToRealtime: (userId: string) => {
    return realtimeService.subscribeToTargetPortfolios(userId, (payload) => {
      const { eventType, old: oldPortfolio, new: newPortfolio } = payload
      
      switch (eventType) {
        case 'INSERT':
          if (newPortfolio) {
            const transformedPortfolio = {
              ...newPortfolio,
              allocations: newPortfolio.allocations as unknown as TargetPortfolioAllocations
            } as TargetPortfolioData
            set(state => ({
              targetPortfolios: [transformedPortfolio, ...state.targetPortfolios]
            }))
          }
          break
          
        case 'UPDATE':
          if (newPortfolio) {
            const transformedPortfolio = {
              ...newPortfolio,
              allocations: newPortfolio.allocations as unknown as TargetPortfolioAllocations
            } as TargetPortfolioData
            set(state => ({
              targetPortfolios: state.targetPortfolios.map(portfolio => 
                portfolio.id === transformedPortfolio.id ? transformedPortfolio : portfolio
              ),
              selectedTargetPortfolio: state.selectedTargetPortfolio?.id === transformedPortfolio.id 
                ? transformedPortfolio 
                : state.selectedTargetPortfolio
            }))
          }
          break
          
        case 'DELETE':
          if (oldPortfolio) {
            set(state => ({
              targetPortfolios: state.targetPortfolios.filter(portfolio => 
                portfolio.id !== oldPortfolio.id
              ),
              selectedTargetPortfolio: state.selectedTargetPortfolio?.id === oldPortfolio.id 
                ? null 
                : state.selectedTargetPortfolio
            }))
          }
          break
      }
    })
  },

  // Persist selected portfolio to session storage
  saveSelectedToSession: () => {
    const { selectedTargetPortfolio } = get()
    if (selectedTargetPortfolio) {
      saveToSession(SESSION_KEYS.SELECTED_TARGET_PORTFOLIO, selectedTargetPortfolio)
    }
  },

  // Load selected portfolio from session storage
  loadSelectedFromSession: () => {
    const cachedPortfolio = loadFromSession(SESSION_KEYS.SELECTED_TARGET_PORTFOLIO) as TargetPortfolioData | null
    if (cachedPortfolio) {
      set({ selectedTargetPortfolio: cachedPortfolio })
    } else {
      set({ selectedTargetPortfolio: null })
    }
  }
}))