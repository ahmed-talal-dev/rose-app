// ─── ApiError ─────────────────────────────────────────────────────────────────
// Shared error class used by both fetch.client.ts and fetch.server.ts.
// Carries the HTTP status code and optional field-level validation errors
// returned by the API so components can map them onto form fields.
//
// Usage:
//   import { ApiError } from "@/shared/lib/apis/api-error";
//   onError: (err: ApiError) => { err.errors?.forEach(...) }
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
    status: number;
    errors?: Array<{ path: string; message: string }>;

    constructor(
        message: string,
        status: number,
        errors?: Array<{ path: string; message: string }>
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}