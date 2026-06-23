import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Testimonial, TestimonialsParams } from "../types";

export const getTestimonials = (params?: TestimonialsParams) =>
    fetchClient<PaginatedPayload<Testimonial>>("/testimonials", { params });