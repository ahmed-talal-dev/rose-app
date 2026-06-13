import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | undefined>;
};

export class ApiError extends Error {
    status: number;
    errors?: Array<{ path: string; message: string }>;

    constructor(message: string, status: number, errors?: Array<{ path: string; message: string }>) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}

export async function fetchClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const session = await getSession();
    const { params, ...init } = options;

    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) url.searchParams.append(key, String(value));
        });
    }

    const headers: HeadersInit = {
        ...(!(init.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(session?.user?.accessToken && {
            Authorization: `Bearer ${session.user.accessToken}`,
        }),
        ...init.headers,
    };

    const res = await fetch(url.toString(), { ...init, headers });
    
    let data: any;
    try {
        data = await res.json();
    } catch (e) {
        throw new ApiError("Failed to parse response", res.status);
    }

    if (!res.ok || !data.status) {
        throw new ApiError(data.message || "Something went wrong", res.status, data.errors);
    }

    return data.payload as T;
}