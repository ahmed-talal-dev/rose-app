import { useQuery } from "@tanstack/react-query";
import { getTestimonials } from "../apis";
import { TestimonialsParams } from "../types";

export const useTestimonials = (params?: TestimonialsParams) =>
    useQuery({
        queryKey: ["testimonials", params],
        queryFn: () => getTestimonials(params),
    });