import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | undefined>;
};

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
        "Content-Type": "application/json",
        ...(session?.user?.accessToken && {
            Authorization: `Bearer ${session.user.accessToken}`,
        }),
        ...init.headers,
    };

    const res = await fetch(url.toString(), { ...init, headers });
    const data = await res.json();

    if (!res.ok || !data.status) {
        throw new Error(data.message || "Something went wrong");
    }

    return data.payload as T;
}   