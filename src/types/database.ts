export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Type for JSON data that will be stored in database
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      stocks: {
        Row: {
          id: string
          user_id: string
          stock_name: string
          ticker: string | null
          quantity: number
          purchase_price: number
          current_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stock_name: string
          ticker?: string | null
          quantity: number
          purchase_price: number
          current_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stock_name?: string
          ticker?: string | null
          quantity?: number
          purchase_price?: number
          current_price?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stocks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      target_portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          allocations: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          allocations: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          allocations?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'target_portfolios_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types
export type Stock = Tables<'stocks'>
export type TargetPortfolio = Tables<'target_portfolios'>

// Portfolio allocation type
export type PortfolioAllocation = {
  [ticker: string]: number
}

// Extended types for business logic
export type StockWithValue = Stock & {
  totalValue: number
  profitLoss: number
  profitLossPercent: number
}

export type PortfolioSummary = {
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  stocks: StockWithValue[]
}

export type PortfolioComparison = {
  current: PortfolioAllocation
  target: PortfolioAllocation
  differences: PortfolioAllocation
}
