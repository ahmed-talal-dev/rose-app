import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Testimonial, TestimonialsParams } from "../types";

export const getTestimonials = (params?: TestimonialsParams) =>
    fetchClient<PaginatedPayload<Testimonial>>("/api/testimonials", {
        params: {
            ...params,
            isApproved: params?.isApproved !== undefined
                ? String(params.isApproved)
                : undefined,
        },
    });