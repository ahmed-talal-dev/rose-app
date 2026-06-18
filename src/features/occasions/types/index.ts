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

export interface CreateOccasionInput {
    title: string;
    image?: string;
}

export interface UpdateOccasionInput {
    title?: string;
    image?: string;
}