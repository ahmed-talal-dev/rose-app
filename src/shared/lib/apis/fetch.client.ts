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

// Helper to recursively map backend keys to old keys
function mapBackendKeys(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(mapBackendKeys);
    }
    if (obj !== null && typeof obj === "object") {
        const mapped: any = {};
        for (const key of Object.keys(obj)) {
            let newKey = key;
            let val = obj[key];

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
            } else if (key === "quantity" && ("title" in obj || "priceAfterDiscount" in obj || "sold" in obj)) {
                newKey = "stock";
            } else if (key === "name" && ("productsCount" in obj || "slug" in obj)) {
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
                val = val.map((item: any) => {
                    const mappedProduct = mapBackendKeys(item.product);
                    return {
                        ...item,
                        id: mappedProduct?.id || item.id || item._id,
                        product: mappedProduct
                    };
                });
            }

            if (key === "category") {
                if (typeof val === "string") {
                    mapped["categoryId"] = val;
                } else if (val && typeof val === "object") {
                    mapped["categoryId"] = val.id || val._id || "";
                }
            }
            if (key === "occasion") {
                if (typeof val === "string") {
                    mapped["occasionId"] = val;
                } else if (val && typeof val === "object") {
                    mapped["occasionId"] = val.id || val._id || "";
                }
            }

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
            if (typeof window !== "undefined") {
                window.localStorage.setItem("reset_email", bodyObj.email || "");
            }
            init.body = JSON.stringify({ email: bodyObj.email });
        }
    } else if (finalEndpoint === "/auth/reset-password") {
        // Reset password needs verify reset code and then reset password
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            const email = (typeof window !== "undefined" && window.localStorage.getItem("reset_email")) || "";
            
            // 1. Verify Reset Code
            const verifyRes = await fetch(`${BASE_URL}/auth/verifyResetCode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resetCode: bodyObj.token })
            });
            if (!verifyRes.ok) {
                let errData;
                try { errData = await verifyRes.json(); } catch {}
                throw new ApiError(errData?.error || errData?.message || "Failed to verify reset code", verifyRes.status);
            }

            // 2. Perform Reset Password
            const resetRes = await fetch(`${BASE_URL}/auth/resetPassword`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword: bodyObj.newPassword })
            });
            if (!resetRes.ok) {
                let errData;
                try { errData = await resetRes.json(); } catch {}
                throw new ApiError(errData?.error || errData?.message || "Failed to reset password", resetRes.status);
            }

            // Return mock successful payload
            return { status: true } as unknown as T;
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
                        let errData;
                        try { errData = await uploadRes.json(); } catch {}
                        throw new ApiError(errData?.error || errData?.message || "Failed to upload photo", uploadRes.status);
                    }
                }

                const editProfileBody: Record<string, any> = {};
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
                product: bodyObj.productId,
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
            const newBody: Record<string, any> = {
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
    } else if (finalEndpoint === "/orders" && method === "POST") {
        if (init.body && typeof init.body === "string") {
            const bodyObj = JSON.parse(init.body);
            const addressId = bodyObj.addressId;
            const isCard = bodyObj.paymentMethod === "CREDIT_CARD";

            const addresses = await fetchClient<any[]>("/api/addresses");
            const address = addresses.find((addr: any) => addr.id === addressId);
            if (!address) {
                throw new ApiError("Selected address not found", 400);
            }

            const newOrderBody = {
                shippingAddress: {
                    street: address.street,
                    phone: address.phone,
                    city: address.city,
                    lat: address.lat || "0",
                    long: address.long || "0"
                }
            };

            if (isCard) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                finalEndpoint = `/orders/checkout?url=${encodeURIComponent(appUrl)}`;
            } else {
                finalEndpoint = "/orders";
            }
            init.body = JSON.stringify(newOrderBody);
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
                let valStr = String(value);
                if (valStr === "wedding") {
                    mappedParams["occasion"] = "69d988724461df0f939b57ea";
                } else if (valStr === "anniversary") {
                    mappedParams["occasion"] = "69d988734461df0f939b57f3";
                } else if (valStr === "engagement") {
                    mappedParams["occasion"] = "69d988724461df0f939b57ea";
                } else {
                    mappedParams["occasion"] = valStr;
                }
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

    let data: any;
    try {
        data = await res.json();
    } catch {
        throw new ApiError("Failed to parse response", res.status);
    }

    if (!res.ok) {
        const errMsg = data.error || data.message || "Something went wrong";
        throw new ApiError(errMsg, res.status, data.errors);
    }

    if (finalEndpoint === "/wishlist" && method === "GET") {
        const products = data.wishlist?.products || [];
        const mappedProducts = mapBackendKeys(products);
        return {
            data: mappedProducts
        } as unknown as T;
    }

    if (finalEndpoint.startsWith("/addresses")) {
        const addrList = data.address || data.addresses;
        if (Array.isArray(addrList)) {
            const mappedList = mapBackendKeys(addrList);
            if (method === "GET") {
                return mappedList as unknown as T;
            } else {
                return (mappedList.length > 0 ? mappedList[0] : null) as unknown as T;
            }
        }
    }

    if (data.token && data.user) {
        const mappedUser = mapBackendKeys(data.user);
        return {
            user: mappedUser,
            token: data.token
        } as unknown as T;
    }

    if (data.user && !data.token) {
        return mapBackendKeys(data.user) as unknown as T;
    }

    if (data.cart) {
        const mappedCart = mapBackendKeys(data.cart);
        mappedCart.id = mappedCart.id || "cart_id";
        return mappedCart as unknown as T;
    }

    if (data.metadata) {
        const rawMeta = data.metadata;
        const metadata = {
            page: rawMeta.currentPage || 1,
            limit: rawMeta.limit || 10,
            total: rawMeta.totalItems || 0,
            totalPages: rawMeta.totalPages || 1
        };

        let listData: any[] = [];
        for (const key of Object.keys(data)) {
            if (Array.isArray(data[key]) && key !== "errors") {
                listData = data[key];
                break;
            }
        }

        const mappedData = mapBackendKeys(listData);
        return {
            data: mappedData,
            metadata
        } as unknown as T;
    }

    // If it's a single resource response under a key like product, category, occasion, order, etc.
    const resourceKeys = ["product", "category", "occasion", "order", "address", "coupon", "notification"];
    for (const key of resourceKeys) {
        if (data[key] && typeof data[key] === "object") {
            if (Array.isArray(data[key])) {
                if (data[key].length > 0) {
                    return mapBackendKeys(data[key][0]) as unknown as T;
                }
            } else {
                return mapBackendKeys(data[key]) as unknown as T;
            }
        }
    }

    // If it is a list response but without metadata (e.g. addresses, wishlist)
    const listKeys = ["addresses", "wishlist", "products", "categories", "occasions", "orders", "notifications", "coupons"];
    for (const key of listKeys) {
        if (data[key] && Array.isArray(data[key])) {
            return mapBackendKeys(data[key]) as unknown as T;
        }
    }

    if (data.data) {
        return mapBackendKeys(data.data) as unknown as T;
    }

    return mapBackendKeys(data) as unknown as T;
}