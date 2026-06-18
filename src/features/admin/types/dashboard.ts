import { ElementType } from "react";

export type StatColor = "primary" | "blue" | "purple" | "green";
export type RevenueFilter = "monthly" | "weekly";

export interface StatItem {
    label: string;
    value: string;
    icon: ElementType;
    color: StatColor;
}

export interface CategoryItem {
    name: string;
    count: number;
}

export interface OrderStatusItem {
    name: string;
    value: number;
    pct: number;
    color: string;
}

export interface RevenueDataPoint {
    month: string;
    value: number;
}

export interface ProductItem {
    name: string;
    price: string;
    sales: number;
    rank: number;
}

export interface StockItem {
    name: string;
    stock: number;
}

export interface NavItem {
    label: string;
    icon: ElementType;
    active: boolean;
}
