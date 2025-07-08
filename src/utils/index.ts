// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const calculateProfitLoss = (
  quantity: number,
  purchasePrice: number,
  currentPrice: number
): { profit: number; profitRate: number } => {
  const totalPurchase = quantity * purchasePrice;
  const totalCurrent = quantity * currentPrice;
  const profit = totalCurrent - totalPurchase;
  const profitRate = totalPurchase > 0 ? profit / totalPurchase : 0;
  
  return { profit, profitRate };
};

export const calculatePortfolioValue = (
  stocks: Array<{ quantity: number; current_price: number }>
): number => {
  return stocks.reduce((total, stock) => total + (stock.quantity * stock.current_price), 0);
};