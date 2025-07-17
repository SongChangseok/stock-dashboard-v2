import { supabase } from './supabase'
import { errorService } from './errorService'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '../types/database'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

/**
 * Real-time update service for Supabase
 */
class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptions: Map<string, Array<(payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    old?: Record<string, unknown>
    new?: Record<string, unknown>
  }) => void>> = new Map()

  /**
   * Subscribe to real-time updates for a specific table
   */
  subscribe<T extends TableName>(
    table: T,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      old?: Tables[T]['Row']
      new?: Tables[T]['Row']
    }) => void,
    filter?: {
      column: string
      value: string | number | boolean
    }
  ): () => void {
    const channelName = filter 
      ? `${table}:${filter.column}=eq.${filter.value}`
      : table

    // Create channel if it doesn't exist
    if (!this.channels.has(channelName)) {
      const channel = supabase.channel(channelName)
      
      channel.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: table as string,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` })
        },
        (payload) => {
          // Notify all subscribers
          const subscribers = this.subscriptions.get(channelName) || []
          subscribers.forEach(subscriber => {
            try {
              subscriber(payload)
            } catch (error) {
              errorService.handleError(
                error instanceof Error ? error : new Error('Real-time callback error'),
                { context: { table, channelName } }
              )
            }
          })
        }
      )

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Real-time subscription active for ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Real-time subscription error for ${channelName}`)
          errorService.handleError(
            new Error(`Real-time subscription error for ${channelName}`),
            { context: { table, channelName } }
          )
        }
      })

      this.channels.set(channelName, channel)
      this.subscriptions.set(channelName, [])
    }

    // Add callback to subscribers
    const subscribers = this.subscriptions.get(channelName) || []
    subscribers.push(callback as any)
    this.subscriptions.set(channelName, subscribers)

    // Return unsubscribe function
    return () => {
      const currentSubscribers = this.subscriptions.get(channelName) || []
      const filteredSubscribers = currentSubscribers.filter(sub => sub !== callback)
      
      if (filteredSubscribers.length === 0) {
        // No more subscribers, remove channel
        const channel = this.channels.get(channelName)
        if (channel) {
          channel.unsubscribe()
          this.channels.delete(channelName)
        }
        this.subscriptions.delete(channelName)
      } else {
        this.subscriptions.set(channelName, filteredSubscribers)
      }
    }
  }

  /**
   * Subscribe to stock updates for a specific user
   */
  subscribeToStocks(
    userId: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      old?: Tables['stocks']['Row']
      new?: Tables['stocks']['Row']
    }) => void
  ): () => void {
    return this.subscribe('stocks', callback, { column: 'user_id', value: userId })
  }

  /**
   * Subscribe to target portfolio updates for a specific user
   */
  subscribeToTargetPortfolios(
    userId: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      old?: Tables['target_portfolios']['Row']
      new?: Tables['target_portfolios']['Row']
    }) => void
  ): () => void {
    return this.subscribe('target_portfolios', callback, { column: 'user_id', value: userId })
  }

  /**
   * Subscribe to all tables for a specific user
   */
  subscribeToUserData(
    userId: string,
    callbacks: {
      stocks?: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; old?: Tables['stocks']['Row']; new?: Tables['stocks']['Row'] }) => void
      target_portfolios?: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; old?: Tables['target_portfolios']['Row']; new?: Tables['target_portfolios']['Row'] }) => void
    }
  ): () => void {
    const unsubscribers: Array<() => void> = []

    if (callbacks.stocks) {
      unsubscribers.push(this.subscribeToStocks(userId, callbacks.stocks))
    }

    if (callbacks.target_portfolios) {
      unsubscribers.push(this.subscribeToTargetPortfolios(userId, callbacks.target_portfolios))
    }

    // Return function to unsubscribe from all
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }

  /**
   * Get connection status for a channel
   */
  getChannelStatus(channelName: string): string {
    const channel = this.channels.get(channelName)
    return channel ? channel.state : 'CLOSED'
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }

  /**
   * Disconnect all channels
   */
  disconnectAll(): void {
    this.channels.forEach((channel, channelName) => {
      channel.unsubscribe()
      console.log(`Disconnected from ${channelName}`)
    })
    this.channels.clear()
    this.subscriptions.clear()
  }

  /**
   * Reconnect all channels (useful after network issues)
   */
  reconnectAll(): void {
    const channelNames = Array.from(this.channels.keys())
    this.disconnectAll()
    
    // Channels will be recreated when subscribers are re-added
    console.log(`Reconnecting ${channelNames.length} real-time channels`)
  }
}

export const realtimeService = new RealtimeService()

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeService.disconnectAll()
  })
}