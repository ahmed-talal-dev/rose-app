import { fetchClient } from "@/shared/lib/apis/fetch.client";
import {
  OverallStatistics,
  ProductStatistics,
  OrderStatusBreakdown,
  CategoryStatistic,
  RevenueTrends,
} from "../types/statistics";

export const getOverallStatistics = () =>
  fetchClient<OverallStatistics>("/api/statistics/overall");

export const getProductStatistics = () =>
  fetchClient<ProductStatistics>("/api/statistics/products");

export const getOrderStatistics = () =>
  fetchClient<OrderStatusBreakdown>("/api/statistics/orders");

export const getCategoryStatistics = () =>
  fetchClient<{ categories: CategoryStatistic[] }>("/api/statistics/categories")
    .then(res => Array.isArray(res) ? res : (res as { categories?: CategoryStatistic[] }).categories ?? []);

export const getRevenueTrends = (interval: "daily" | "weekly" | "monthly") => {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  return fetchClient<RevenueTrends>("/api/reports/sales/trends", {
    params: { startDate, endDate, interval },
  });
};
