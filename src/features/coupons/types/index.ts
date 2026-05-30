import { PaginationParams } from "@/shared/types";

export type CouponType = "PERCENT" | "FIXED";

export type Coupon = {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CouponsParams = PaginationParams;

export type CreateCouponInput = {
    code: string;
    type: CouponType;
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    validFrom: string;
    validUntil: string;
    isActive?: boolean;
};

export type UpdateCouponInput = Partial<CreateCouponInput>;