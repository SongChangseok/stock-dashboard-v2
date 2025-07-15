import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PreferencesState } from '../types/store'

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // UI preferences
      viewMode: 'table', // 'table' | 'cards'
      currency: 'USD',
      language: 'en',
      theme: 'dark',
      
      // Portfolio preferences
      defaultSortOrder: 'name', // 'name' | 'value' | 'profit' | 'weight'
      defaultSortDirection: 'asc', // 'asc' | 'desc'
      showProfitLoss: true,
      showPercentageChange: true,
      autoRefreshInterval: 30000, // 30 seconds
      
      // Chart preferences
      chartType: 'pie', // 'pie' | 'doughnut' | 'bar'
      showLegend: true,
      showTooltips: true,
      animateCharts: true,
      
      // Notification preferences
      enableNotifications: true,
      notifyOnLargeChanges: true,
      largeChangeThreshold: 5, // 5% change
      
      // Rebalancing preferences
      defaultRebalanceThreshold: 1, // 1% threshold
      defaultMinimumTradingUnit: 1,
      defaultCommission: 0,
      
      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      
      setSortOrder: (order) => set({ defaultSortOrder: order }),
      setSortDirection: (direction) => set({ defaultSortDirection: direction }),
      setShowProfitLoss: (show) => set({ showProfitLoss: show }),
      setShowPercentageChange: (show) => set({ showPercentageChange: show }),
      setAutoRefreshInterval: (interval) => set({ autoRefreshInterval: interval }),
      
      setChartType: (type) => set({ chartType: type }),
      setShowLegend: (show) => set({ showLegend: show }),
      setShowTooltips: (show) => set({ showTooltips: show }),
      setAnimateCharts: (animate) => set({ animateCharts: animate }),
      
      setEnableNotifications: (enable) => set({ enableNotifications: enable }),
      setNotifyOnLargeChanges: (notify) => set({ notifyOnLargeChanges: notify }),
      setLargeChangeThreshold: (threshold) => set({ largeChangeThreshold: threshold }),
      
      setDefaultRebalanceThreshold: (threshold) => set({ defaultRebalanceThreshold: threshold }),
      setDefaultMinimumTradingUnit: (unit) => set({ defaultMinimumTradingUnit: unit }),
      setDefaultCommission: (commission) => set({ defaultCommission: commission }),
      
      // Bulk update preferences
      updatePreferences: (preferences) => set((state) => ({ ...state, ...preferences })),
      
      // Reset to defaults
      resetPreferences: () => set({
        viewMode: 'table',
        currency: 'USD',
        language: 'en',
        theme: 'dark',
        defaultSortOrder: 'name',
        defaultSortDirection: 'asc',
        showProfitLoss: true,
        showPercentageChange: true,
        autoRefreshInterval: 30000,
        chartType: 'pie',
        showLegend: true,
        showTooltips: true,
        animateCharts: true,
        enableNotifications: true,
        notifyOnLargeChanges: true,
        largeChangeThreshold: 5,
        defaultRebalanceThreshold: 1,
        defaultMinimumTradingUnit: 1,
        defaultCommission: 0
      })
    }),
    {
      name: 'user-preferences', // localStorage key
      version: 1, // Version for migrations
      migrate: (persistedState: Record<string, unknown>, version: number) => {
        // Handle migrations between versions
        if (version < 1) {
          // Add default values for new preferences
          return {
            ...persistedState,
            enableNotifications: true,
            notifyOnLargeChanges: true,
            largeChangeThreshold: 5
          }
        }
        return persistedState
      }
    }
  )
)