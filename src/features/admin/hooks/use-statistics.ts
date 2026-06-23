import { useQuery } from "@tanstack/react-query";
import {
  getOverallStatistics,
  getProductStatistics,
  getOrderStatistics,
  getCategoryStatistics,
  getRevenueTrends,
} from "../apis";

export const statisticsKeys = {
  overall: ["statistics", "overall"] as const,
  products: ["statistics", "products"] as const,
  orders: ["statistics", "orders"] as const,
  categories: ["statistics", "categories"] as const,
  trends: (interval: string) => ["statistics", "trends", interval] as const,
};

export const useOverallStatistics = () =>
  useQuery({
    queryKey: statisticsKeys.overall,
    queryFn: getOverallStatistics,
  });

export const useProductStatistics = () =>
  useQuery({
    queryKey: statisticsKeys.products,
    queryFn: getProductStatistics,
  });

export const useOrderStatistics = () =>
  useQuery({
    queryKey: statisticsKeys.orders,
    queryFn: getOrderStatistics,
  });

export const useCategoryStatistics = () =>
  useQuery({
    queryKey: statisticsKeys.categories,
    queryFn: getCategoryStatistics,
  });

export const useRevenueTrends = (interval: "daily" | "weekly" | "monthly") =>
  useQuery({
    queryKey: statisticsKeys.trends(interval),
    queryFn: () => getRevenueTrends(interval),
  });
