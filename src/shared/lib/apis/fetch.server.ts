import { auth } from "@/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | undefined>;
};

// It is highly recommended to move this class to a shared utility file (e.g., src/shared/lib/apis/error.ts) 
// to be imported and used by both fetch.client.ts and fetch.server.ts
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

export async function fetchServer<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const session = await auth();
    const { params, ...init } = options;

    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) url.searchParams.append(key, String(value));
        });
    }

    const headers: HeadersInit = {
        // Prevent setting "Content-Type": "application/json" when sending FormData (e.g., file uploads)
        ...(!(init.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(session?.user?.accessToken && {
            Authorization: `Bearer ${session.user.accessToken}`,
        }),
        ...init.headers,
    };

    const res = await fetch(url.toString(), { ...init, headers });

    // Safely parse the JSON response to prevent crashes if the server returns an unexpected HTML/Text error page
    let data: unknown;
    try {
        data = await res.json();
    } catch {
        throw new ApiError("Failed to parse response", res.status);
    }

    if (!res.ok || !(data as { status: boolean }).status) {
        const d = data as { message?: string; errors?: Array<{ path: string; message: string }> };
        throw new ApiError(d.message || "Something went wrong", res.status, d.errors);
    }

    return (data as { payload: T }).payload;
}