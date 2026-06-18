import {
    LayoutDashboard,
    Package,
    ReceiptText,
    ClipboardList,
    CalendarHeart,
    CircleDollarSign,
} from "lucide-react";
import { StatItem, CategoryItem, OrderStatusItem, RevenueDataPoint, ProductItem, StockItem, StatColor } from "../types/dashboard";

export const CHART_COLORS = {
    completed: "#00BC7D",
    inProgress: "#2B7FFF",
    canceled: "#DC2626",
    primaryStroke: "#A6252A",
} as const;

export const RANK_BG_CLASSES: Record<number, string> = {
    1: "bg-gradient-to-r from-[rgba(250,199,117,0.25)] to-[rgba(250,199,117,0.06)]",
    2: "bg-gradient-to-r from-[rgba(180,178,169,0.25)] to-[rgba(180,178,169,0.06)]",
    3: "bg-gradient-to-r from-[rgba(239,159,39,0.25)]  to-[rgba(239,159,39,0.06)]",
};

export const STATS: StatItem[] = [
    { label: "Total products", value: "12", icon: Package, color: "primary" },
    { label: "Total orders", value: "1,284", icon: ReceiptText, color: "blue" },
    { label: "Total categories", value: "125", icon: ClipboardList, color: "purple" },
    { label: "Total revenue", value: "6,824,528 EGP", icon: CircleDollarSign, color: "green" },
];

export const CATEGORIES: CategoryItem[] = [
    { name: "Chocolate", count: 4 },
    { name: "Flowers", count: 8 },
    { name: "Chocolate", count: 4 },
    { name: "Chocolate", count: 4 },
    { name: "Chocolate", count: 4 },
];

export const ORDER_STATUS: OrderStatusItem[] = [
    { name: "Completed", value: 216, pct: 33, color: CHART_COLORS.completed },
    { name: "In progress", value: 513, pct: 57, color: CHART_COLORS.inProgress },
    { name: "Canceled", value: 19, pct: 10, color: CHART_COLORS.canceled },
];

export const MONTHLY_REVENUE: RevenueDataPoint[] = [
    { month: "0", value: 3000 },
    { month: "Jan", value: 4400 },
    { month: "Feb", value: 3500 },
    { month: "Mar", value: 4100 },
    { month: "Apr", value: 3400 },
    { month: "May", value: 3250 },
    { month: "Jun", value: 4500 },
    { month: "Jul", value: 3300 },
    { month: "Aug", value: 3600 },
    { month: "Sep", value: 4350 },
    { month: "Oct", value: 3550 },
]; export const WEEKLY_REVENUE: RevenueDataPoint[] = [
    { month: "0", value: 300 },
    { month: "Mon", value: 400 },
    { month: "Tue", value: 650 },
    { month: "Wed", value: 520 },
    { month: "Thu", value: 810 },
    { month: "Fri", value: 930 },
    { month: "Sat", value: 720 },
    { month: "Sun", value: 540 },
];
export const TOP_PRODUCTS: ProductItem[] = [
    { name: "25 Red Roses | Black Wrap", price: "1,999 EGP", sales: 5011, rank: 1 },
    { name: "Wedding Flower", price: "440 EGP", sales: 1464, rank: 2 },
    { name: "Moko Chocolate Set | Esperance Rose", price: "1,200 EGP", sales: 1042, rank: 3 },
    { name: "Red Wedding Flower", price: "250 EGP", sales: 813, rank: 4 },
    { name: "Patchi Chocolate 500g | Lilac...", price: "1,900 EGP", sales: 194, rank: 5 },
    { name: "Patchi Chocolate 500g | Lilac...", price: "1,900 EGP", sales: 194, rank: 6 },
    { name: "Patchi Chocolate 500g | Lilac...", price: "1,900 EGP", sales: 194, rank: 7 },
];

export const LOW_STOCK: StockItem[] = [
    { name: "25 Red Roses | Black Wrap", stock: 0 },
    { name: "25 Red Roses | Black Wrap", stock: 0 },
    { name: "25 Red Roses | Black Wrap", stock: 2 },
    { name: "25 Red Roses | Black Wrap", stock: 4 },
    { name: "25 Red Roses | Black Wrap", stock: 10 },
    { name: "25 Red Roses | Black Wrap", stock: 12 },
    { name: "25 Red Roses | Black Wrap", stock: 19 },
    { name: "25 Red Roses | Black Wrap", stock: 19 },
];

export const NAV_ITEMS = [
    { label: "Overview", icon: LayoutDashboard, id: "overview" },
    { label: "Categories", icon: ClipboardList, id: "categories" },
    { label: "Occasions", icon: CalendarHeart, id: "occasions" },
    { label: "Products", icon: Package, id: "products" },
] as const;

export const STAT_COLOR_CLASSES: Record<
    StatColor,
    { card: string; icon: string; text: string }
> = {
    primary: {
        card: "bg-primary-50 dark:bg-primary-950/20",
        icon: "text-primary-600 dark:text-rose-300",
        text: "text-primary-600 dark:text-rose-300",
    },
    blue: {
        card: "bg-blue-600/5 dark:bg-blue-950/10",
        icon: "text-blue-600 dark:text-blue-300",
        text: "text-blue-600 dark:text-blue-300",
    },
    purple: {
        card: "bg-purple-600/5 dark:bg-purple-950/10",
        icon: "text-purple-600 dark:text-purple-300",
        text: "text-purple-600 dark:text-purple-300",
    },
    green: {
        card: "bg-green-600/5 dark:bg-green-950/10",
        icon: "text-green-600 dark:text-green-300",
        text: "text-green-600 dark:text-green-300",
    },
};
