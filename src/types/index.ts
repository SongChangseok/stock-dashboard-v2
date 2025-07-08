// Database types
export interface Profile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: string;
  user_id: string;
  stock_name: string;
  ticker?: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

export interface TargetPortfolio {
  id: string;
  user_id: string;
  name: string;
  allocations: Record<string, number>;
  created_at: string;
  updated_at: string;
}

// UI types
export interface StockFormData {
  stock_name: string;
  ticker?: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
}