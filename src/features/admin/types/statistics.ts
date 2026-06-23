export interface OverallStatistics {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
}

export interface TopProduct {
  id: string;
  title: string;
  price: number;
  sold: number;
  rank: number;
}

export interface LowStockProduct {
  id: string;
  title: string;
  stock: number;
}

export interface ProductStatistics {
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
}

export interface OrderStatusBreakdown {
  completed: number;
  inProgress: number;
  canceled: number;
  completedPct: number;
  inProgressPct: number;
  canceledPct: number;
}

export interface CategoryStatistic {
  id: string;
  title: string;
  productsCount: number;
}

export interface RevenueDataPoint {
  label: string;
  value: number;
}

export interface RevenueTrends {
  data: RevenueDataPoint[];
}
