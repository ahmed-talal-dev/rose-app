import { PaginationParams } from "@/shared/types";

export type Testimonial = {
    id: string;
    name: string;
    email: string;
    content: string;
    rating?: number;
    image?: string;
    isApproved: boolean;
    createdAt: string;
};

export type TestimonialsParams = PaginationParams & {
    isApproved?: boolean;
};