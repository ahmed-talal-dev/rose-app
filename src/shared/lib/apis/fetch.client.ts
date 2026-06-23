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

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// Helper to recursively map backend keys to old keys
function mapBackendKeys(obj: JsonValue): JsonValue {
    if (Array.isArray(obj)) {
        return obj.map(mapBackendKeys);
    }
    if (obj !== null && typeof obj === "object") {
        const objRecord = obj as Record<string, JsonValue>;
        const mapped: Record<string, JsonValue> = {};
        for (const key of Object.keys(objRecord)) {
            let newKey = key;
            let val = objRecord[key];

            if (key === "_id") {
                newKey = "id";
            } else if (key === "imgCover") {
                newKey = "cover";
            } else if (key === "images") {
                newKey = "gallery";
            } else if (key === "rateAvg") {
                newKey = "rating";
            } else if (key === "rateCount") {
                newKey = "ratings";
            } else if (key === "quantity" && ("title" in objRecord || "priceAfterDiscount" in objRecord || "sold" in objRecord)) {
                newKey = "stock";
            } else if (key === "name" && ("productsCount" in objRecord || "slug" in objRecord)) {
                newKey = "title";
            } else if (key === "username") {
                newKey = "title";
            } else if (key === "lat") {
                newKey = "latitude";
            } else if (key === "long") {
                newKey = "longitude";
            }

            if (key === "image" && typeof val === "string" && val && !val.startsWith("http")) {
                val = `https://flower.elevateegy.com/uploads/${val}`;
            }

            val = mapBackendKeys(val);

            // Special mapping for cartItems inside cart
            if (key === "cartItems" && Array.isArray(val)) {
                val = val.map((itemVal) => {
                    const item = itemVal as Record<string, JsonValue>;
                    const mappedProduct = mapBackendKeys(item?.product) as Record<string, JsonValue> | null;
                    return {
                        ...item,
                        id: mappedProduct?.id || item?.id || item?._id || null,
                        product: mappedProduct
                    };
                });
            }

            if (key === "category") {
                if (typeof val === "string") {
                    mapped["categoryId"] = val;
                } else if (val && typeof val === "object" && !Array.isArray(val)) {
                    const valRecord = val as Record<string, JsonValue>;
                    mapped["categoryId"] = valRecord.id || valRecord._id || "";
                }
            }
            if (key === "occasion") {
                if (typeof val === "string") {
                    mapped["occasionId"] = val;
                } else if (val && typeof val === "object" && !Array.isArray(val)) {
                    const valRecord = val as Record<string, JsonValue>;
                    mapped["occasionId"] = valRecord.id || valRecord._id || "";
                }
            }

            mapped[key] = val;
            mapped[newKey] = val;
        }
        return mapped;
    }
    return obj;
}

export async function fetchClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const session = await getSession();
    const { params, ...init } = options;

    let finalEndpoint = endpoint;
    let method = init.method || "GET";

    // Strip out /api prefix if present
    if (finalEndpoint.startsWith("/api/v1")) {
        finalEndpoint = finalEndpoint.slice(7);
    } else if (finalEndpoint.startsWith("/api")) {
        finalEndpoint = finalEndpoint.slice(4);
    }

    // Intercept specific endpoint mappings
    if (finalEndpoint === "/auth/register") {
        finalEndpoint = "/auth/signup";
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            const signupBody = {
                firstName: bodyObj.firstName,
                lastName: bodyObj.lastName,
                email: bodyObj.email,
                password: bodyObj.password,
                rePassword: bodyObj.confirmPassword || bodyObj.rePassword,
                phone: bodyObj.phone,
                gender: bodyObj.gender ? bodyObj.gender.toLowerCase() : "male"
            };
            init.body = JSON.stringify(signupBody);
        }
    } else if (finalEndpoint === "/auth/login") {
        finalEndpoint = "/auth/signin";
    } else if (finalEndpoint === "/auth/forgot-password") {
        finalEndpoint = "/auth/forgotPassword";
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            init.body = JSON.stringify({ email: bodyObj.email });
        }
    } else if (finalEndpoint.startsWith("/users/profile")) {
        // GET profile: GET /auth/profile-data
        // PATCH/PUT profile: PUT /auth/editProfile
        if (method === "GET") {
            finalEndpoint = "/auth/profile-data";
        } else {
            if (init.body instanceof FormData) {
                const formData = init.body;
                const photoFile = formData.get("photo") || formData.get("image");
                
                if (photoFile) {
                    const uploadFd = new FormData();
                    uploadFd.append("image", photoFile);
                    uploadFd.append("photo", photoFile);
                    
                    const uploadHeaders = {
                        ...(session?.user?.accessToken && {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        }),
                    };
                    const uploadRes = await fetch(`${BASE_URL}/auth/upload-photo`, {
                        method: "PUT",
                        headers: uploadHeaders,
                        body: uploadFd
                    });
                    if (!uploadRes.ok) {
                        let errData: Record<string, unknown> | null = null;
                        try { errData = await uploadRes.json() as Record<string, unknown>; } catch {}
                        const errMsg =
                            typeof errData?.error === "string"
                                ? errData.error
                                : typeof errData?.message === "string"
                                ? errData.message
                                : "Failed to upload photo";
                        throw new ApiError(errMsg, uploadRes.status);
                    }
                }

                const editProfileBody: Record<string, unknown> = {};
                if (formData.has("firstName")) editProfileBody.firstName = formData.get("firstName");
                if (formData.has("lastName")) editProfileBody.lastName = formData.get("lastName");
                if (formData.has("phone")) editProfileBody.phone = formData.get("phone");

                finalEndpoint = "/auth/editProfile";
                method = "PUT";
                init.body = JSON.stringify(editProfileBody);
            } else if (init.body && typeof init.body === "string") {
                finalEndpoint = "/auth/editProfile";
                method = "PUT";
            }
        }
    } else if (finalEndpoint === "/users/change-password") {
        finalEndpoint = "/auth/change-password";
        method = "PATCH";
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            init.body = JSON.stringify({
                password: bodyObj.currentPassword,
                newPassword: bodyObj.newPassword
            });
        }
    } else if (finalEndpoint === "/users/account") {
        finalEndpoint = "/auth/deleteMe";
        method = "DELETE";
    } else if (finalEndpoint === "/cart" && method === "POST") {
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            init.body = JSON.stringify({
                product: bodyObj.productId || bodyObj.product,
                quantity: bodyObj.quantity || 1
            });
        }
    } else if (finalEndpoint.startsWith("/cart/") && method === "PATCH") {
        method = "PUT";
    } else if (finalEndpoint.startsWith("/addresses")) {
        if (method === "POST") {
            method = "PATCH";
        }
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            const newBody: Record<string, unknown> = {
                username: bodyObj.title || "Home",
                city: bodyObj.city,
                street: bodyObj.street,
                phone: bodyObj.phone,
                lat: String(bodyObj.latitude !== undefined ? bodyObj.latitude : (bodyObj.lat !== undefined ? bodyObj.lat : "30.0444")),
                long: String(bodyObj.longitude !== undefined ? bodyObj.longitude : (bodyObj.long !== undefined ? bodyObj.long : "31.2357"))
            };
            init.body = JSON.stringify(newBody);
        }
    } else if (finalEndpoint === "/reviews" && method === "POST") {
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            init.body = JSON.stringify({
                product: bodyObj.productId,
                rating: bodyObj.rating,
                comment: bodyObj.comment
            });
        }
    }

    const url = new URL(`${BASE_URL}${finalEndpoint}`);
    if (params) {
        const mappedParams: Record<string, string> = {};
        let sortBy = params.sortBy as string | undefined;
        let sortOrder = params.sortOrder as string | undefined;

        if (sortBy) {
            let sortField = sortBy;
            if (sortField === "rating") sortField = "rateAvg";
            mappedParams["sort"] = sortOrder === "desc" ? `-${sortField}` : sortField;
        }

        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined) return;

            if (key === "categoryId" || key === "category") {
                mappedParams["category"] = String(value);
            } else if (key === "occasionId" || key === "occasion") {
                mappedParams["occasion"] = String(value);
            } else if (key === "minPrice") {
                mappedParams["price[gte]"] = String(value);
            } else if (key === "maxPrice") {
                mappedParams["price[lte]"] = String(value);
            } else if (key === "productId" || key === "product") {
                mappedParams["product"] = String(value);
            } else if (key === "userId" || key === "user") {
                mappedParams["user"] = String(value);
            } else if (key !== "sortBy" && key !== "sortOrder") {
                mappedParams[key] = String(value);
            }
        });

        Object.entries(mappedParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const headers: HeadersInit = {
        ...(!(init.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(session?.user?.accessToken && {
            Authorization: `Bearer ${session.user.accessToken}`,
        }),
        ...init.headers,
    };

    const res = await fetch(url.toString(), { ...init, method, headers });

    let data: unknown;
    try {
        data = await res.json();
    } catch {
        throw new ApiError("Failed to parse response", res.status);
    }

    if (!res.ok) {
        const errData = data as Record<string, unknown>;
        const errMsg =
            typeof errData?.error === "string"
                ? errData.error
                : typeof errData?.message === "string"
                ? errData.message
                : "Something went wrong";
        throw new ApiError(
            errMsg,
            res.status,
            Array.isArray(errData?.errors) ? (errData.errors as Array<{ path: string; message: string }>) : undefined
        );
    }

    const payload = data as Record<string, unknown>;

    if (finalEndpoint === "/wishlist" && method === "GET") {
        const wishlistObj = payload.wishlist as Record<string, unknown> | undefined;
        const products = wishlistObj?.products || [];
        const mappedProducts = mapBackendKeys(products as JsonValue);
        return {
            data: mappedProducts
        } as T;
    }

    if (finalEndpoint.startsWith("/addresses")) {
        const addrList = payload.address || payload.addresses;
        if (Array.isArray(addrList)) {
            const mappedList = mapBackendKeys(addrList as JsonValue);
            if (method === "GET") {
                return mappedList as T;
            } else {
                return (Array.isArray(mappedList) && mappedList.length > 0 ? mappedList[0] : null) as T;
            }
        }
    }

    if (payload.token && payload.user) {
        const mappedUser = mapBackendKeys(payload.user as JsonValue);
        return {
            user: mappedUser,
            token: payload.token
        } as T;
    }

    if (payload.user && !payload.token) {
        return mapBackendKeys(payload.user as JsonValue) as T;
    }

    if (payload.cart) {
        const mappedCart = mapBackendKeys(payload.cart as JsonValue) as Record<string, unknown>;
        mappedCart.id = mappedCart.id || "cart_id";
        return mappedCart as T;
    }

    if (payload.metadata) {
        const rawMeta = payload.metadata as Record<string, unknown>;
        const metadata = {
            page: rawMeta.currentPage || 1,
            limit: rawMeta.limit || 10,
            total: rawMeta.totalItems || 0,
            totalPages: rawMeta.totalPages || 1
        };

        let listData: unknown[] = [];
        for (const key of Object.keys(payload)) {
            if (Array.isArray(payload[key]) && key !== "errors") {
                listData = payload[key] as unknown[];
                break;
            }
        }

        const mappedData = mapBackendKeys(listData as JsonValue);
        return {
            data: mappedData,
            metadata
        } as T;
    }

    // If it's a single resource response under a key like product, category, occasion, order, etc.
    const resourceKeys = ["product", "category", "occasion", "order", "address", "coupon", "notification"];
    for (const key of resourceKeys) {
        if (payload[key] && typeof payload[key] === "object") {
            const val = payload[key];
            if (Array.isArray(val)) {
                if (val.length > 0) {
                    return mapBackendKeys(val[0] as JsonValue) as T;
                }
            } else {
                return mapBackendKeys(val as JsonValue) as T;
            }
        }
    }

    // If it is a list response but without metadata (e.g. addresses, wishlist)
    const listKeys = ["addresses", "wishlist", "products", "categories", "occasions", "orders", "notifications", "coupons"];
    for (const key of listKeys) {
        if (payload[key] && Array.isArray(payload[key])) {
            return mapBackendKeys(payload[key] as JsonValue) as T;
        }
    }

    if (payload.data) {
        return mapBackendKeys(payload.data as JsonValue) as T;
    }

    return mapBackendKeys(payload as JsonValue) as T;
}