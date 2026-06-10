export interface Occasion {
    id: string;
    title: string;
    description?: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OccasionsParams {
    page?: number;
    limit?: number;
}