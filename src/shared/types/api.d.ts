// Base API Response
export type ApiResponse<T> = {
    status: boolean;
    code: number;
    message: string;
    payload: T;
};

// Pagination Metadata
export type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

// Paginated Response
export type PaginatedPayload<T> = {
    data: T[];
    metadata: PaginationMeta;
};

// Paginated Query Params
export type PaginationParams = {
    page?: number;
    limit?: number;
};