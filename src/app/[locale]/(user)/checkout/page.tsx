"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
    useAddresses,
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress,
} from "@/features/addresses/hooks";
import { useCart, useClearCart } from "@/features/cart/hooks";
import { PhoneInput } from "@/shared/ui/phone-input";
import { useCreateOrder } from "@/features/orders/hooks";
import { useProducts } from "@/features/products/hooks";
import { ProductCard } from "@/features/products/components/product-card";
import {
    Loader2,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Ticket,
    X,
    PhoneIcon,
    MapPin,
    Pencil,
    Trash2,
    Phone,
    ChevronsUpDown,
    Locate,
} from "lucide-react";

interface AddressItem {
    id: string;
    title: string;
    street: string;
    city: string;
    phone: string;
    isPrimary?: boolean;
}

const MOCK_ADDRESSES: AddressItem[] = [
    {
        id: "mock-address-1",
        title: "Home",
        street: "21 Ahmed Mohamed St., King Faisal St.",
        city: "Giza",
        phone: "+201012346578",
        isPrimary: false,
    },
    {
        id: "mock-address-2",
        title: "Work",
        street: "14 Omar Ibn Akhatab St., Ramsis St.",
        city: "Cairo",
        phone: "+201112345678",
        isPrimary: true,
    },
    {
        id: "mock-address-3",
        title: "Family",
        street: "16 El-Gaish Rd, San Stefano, El-Raml 2",
        city: "Alexandria",
        phone: "+201512345678",
        isPrimary: false,
    },
];

export default function CheckoutPage() {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations("checkout");
    const tCart = useTranslations("cart");
    const tCommon = useTranslations("common");
    const { data: session, status } = useSession();

    const { data: addressesData, isLoading: isAddressesLoading } = useAddresses() as any;
    const { data: cartData, isLoading: isCartLoading } = useCart() as any;
    const { data: productsData } = useProducts({ limit: 10 });

    const createAddressMutation = useCreateAddress();
    const updateAddressMutation = useUpdateAddress();
    const deleteAddressMutation = useDeleteAddress();
    const createOrderMutation = useCreateOrder();
    const clearCartMutation = useClearCart();

    const [step, setStep] = useState<1 | 2>(1);
    const [mockAddresses, setMockAddresses] = useState<any[]>(MOCK_ADDRESSES);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("mock-address-2");
    const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "CREDIT_CARD">("CASH_ON_DELIVERY");

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [modalView, setModalView] = useState<"list" | "form">("list");
    const [formStep, setFormStep] = useState<1 | 2>(1);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);
    const [newAddressTitle, setNewAddressTitle] = useState("");
    const [newAddressCity, setNewAddressCity] = useState("");
    const [newAddressStreet, setNewAddressStreet] = useState("");
    const [newAddressPhone, setNewAddressPhone] = useState("");

    const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const hasLoadedPersistedData = useRef(false);

    // Load persisted mock addresses and selected address ID from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedAddresses = localStorage.getItem("mock_addresses");
            if (savedAddresses) {
                try {
                    const parsed = JSON.parse(savedAddresses);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMockAddresses(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse saved mock addresses", e);
                }
            }

            const savedSelectedId = localStorage.getItem("selected_address_id");
            if (savedSelectedId) {
                setSelectedAddressId(savedSelectedId);
            }
            hasLoadedPersistedData.current = true;
        }
    }, []);

    // Sync mockAddresses changes to localStorage
    useEffect(() => {
        if (typeof window !== "undefined" && hasLoadedPersistedData.current && mockAddresses) {
            localStorage.setItem("mock_addresses", JSON.stringify(mockAddresses));
        }
    }, [mockAddresses]);

    // Sync selectedAddressId changes to localStorage and dispatch custom event
    useEffect(() => {
        if (typeof window !== "undefined" && hasLoadedPersistedData.current && selectedAddressId) {
            localStorage.setItem("selected_address_id", selectedAddressId);

            const allAddresses = addressesData && addressesData.length > 0 ? addressesData : mockAddresses;
            const selected = allAddresses.find((a: any) => a.id === selectedAddressId);
            if (selected && selected.city) {
                localStorage.setItem("selected_address_city", selected.city);
            } else {
                localStorage.removeItem("selected_address_city");
            }
            window.dispatchEvent(new Event("addressChanged"));
        }
    }, [selectedAddressId, mockAddresses, addressesData]);

    // Load Google Maps JS SDK dynamically via CDN
    useEffect(() => {
        if (typeof window === "undefined") return;

        if ((window as any).google && (window as any).google.maps) {
            setGoogleMapsLoaded(true);
            return;
        }

        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
            const handleLoad = () => setGoogleMapsLoaded(true);
            existingScript.addEventListener("load", handleLoad);
            return () => {
                existingScript.removeEventListener("load", handleLoad);
            };
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => {
            setGoogleMapsLoaded(true);
        };
        document.head.appendChild(script);
    }, []);

    // Reverse geocode lat/lng to address details using Nominatim (OpenStreetMap) as fallback
    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        setIsGeocoding(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.state || "";
                    const road = data.address.road || "";
                    const suburb = data.address.suburb || data.address.neighbourhood || "";
                    const streetAddress = [road, suburb].filter(Boolean).join(", ") || data.display_name || "";
                    
                    if (city) setNewAddressCity(city);
                    if (streetAddress) setNewAddressStreet(streetAddress);
                }
            }
        } catch (error) {
            console.error("OSM Reverse geocoding error:", error);
        } finally {
            setIsGeocoding(false);
        }
    };

    // Google Maps Geocoder with fallback
    const geocodeCoords = (lat: number, lng: number) => {
        if (!(window as any).google || !(window as any).google.maps) {
            fetchAddressFromCoords(lat, lng);
            return;
        }

        setIsGeocoding(true);
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === "OK" && results && results[0]) {
                let city = "";
                let street = "";
                const addressComponents = results[0].address_components;

                for (const component of addressComponents) {
                    const types = component.types;
                    if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                        city = component.long_name;
                    } else if (types.includes("route") || types.includes("sublocality") || types.includes("neighborhood")) {
                        if (street) street += ", ";
                        street += component.long_name;
                    }
                }

                if (!street) {
                    street = results[0].formatted_address;
                }

                if (city) setNewAddressCity(city);
                if (street) setNewAddressStreet(street);
                setIsGeocoding(false);
            } else {
                console.warn("Google reverse geocoding failed, falling back to OSM Nominatim. Status:", status);
                fetchAddressFromCoords(lat, lng);
            }
        });
    };

    // Geolocation handler
    const handleGeolocateUser = () => {
        if (!navigator.geolocation) {
            toast.error(locale === "ar" ? "تحديد الموقع الجغرافي غير مدعوم في متصفحك" : "Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (mapRef.current && markerRef.current && (window as any).google) {
                    const pos = { lat: latitude, lng: longitude };
                    mapRef.current.setCenter(pos);
                    mapRef.current.setZoom(16);
                    markerRef.current.setPosition(pos);
                    geocodeCoords(latitude, longitude);
                }
            },
            (error) => {
                toast.error(locale === "ar" ? "فشل الحصول على موقعك الجغرافي" : "Failed to retrieve your location");
                console.error("Geolocation error:", error);
            }
        );
    };

    // Map initializer when googleMapsLoaded is true and step 2 is active
    useEffect(() => {
        if (!googleMapsLoaded || formStep !== 2 || typeof window === "undefined" || !(window as any).google) return;

        const google = (window as any).google;
        const defaultLat = 30.0444;
        const defaultLng = 31.2357;
        const mapContainer = document.getElementById("google-map-container");

        if (!mapContainer) return;

        // Initialize map
        const map = new google.maps.Map(mapContainer, {
            center: { lat: defaultLat, lng: defaultLng },
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        // Initialize marker
        const marker = new google.maps.Marker({
            position: { lat: defaultLat, lng: defaultLng },
            map: map,
            draggable: true,
        });

        mapRef.current = map;
        markerRef.current = marker;

        // Marker dragend listener
        marker.addListener("dragend", () => {
            const pos = marker.getPosition();
            if (pos) {
                geocodeCoords(pos.lat(), pos.lng());
            }
        });

        // Map click listener
        map.addListener("click", (e: any) => {
            if (e.latLng) {
                marker.setPosition(e.latLng);
                geocodeCoords(e.latLng.lat(), e.latLng.lng());
            }
        });

        const locateOrFallback = () => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const pos = { lat: latitude, lng: longitude };
                    map.setCenter(pos);
                    map.setZoom(16);
                    marker.setPosition(pos);
                    geocodeCoords(latitude, longitude);
                },
                () => {
                    geocodeCoords(defaultLat, defaultLng);
                }
            );
        };

        if (editingAddressId && newAddressCity) {
            // Try to find existing location via geocoding
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: `${newAddressStreet}, ${newAddressCity}` }, (results: any, status: any) => {
                if (status === "OK" && results && results[0]) {
                    const loc = results[0].geometry.location;
                    map.setCenter(loc);
                    map.setZoom(16);
                    marker.setPosition(loc);
                } else {
                    locateOrFallback();
                }
            });
        } else {
            locateOrFallback();
        }

        return () => {
            mapRef.current = null;
            markerRef.current = null;
        };
    }, [googleMapsLoaded, formStep]);

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);

    const recommendedSliderRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (
            cartData &&
            (!cartData.cartItems || cartData.cartItems.length === 0) &&
            !isCartLoading &&
            !createOrderMutation.isPending &&
            !createOrderMutation.isSuccess
        ) {
            router.push("/cart");
        }
    }, [cartData, isCartLoading, createOrderMutation.isPending, createOrderMutation.isSuccess, router]);

    useEffect(() => {
        if (addressesData && addressesData.length > 0) {
            const primary = addressesData.find((a: any) => a.isPrimary);
            if (primary) {
                setSelectedAddressId(primary.id);
            } else {
                setSelectedAddressId(addressesData[0].id);
            }
        }
    }, [addressesData]);

    if (status === "loading" || isCartLoading || isAddressesLoading) {
        return (
            <div className="mx-auto max-w-[1280px] px-4 py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-[40px] h-[40px] animate-spin text-[#A6252A]" />
                <span className="text-zinc-500 dark:text-zinc-400 font-sarabun text-[14px]">
                    {tCommon("loading")}
                </span>
            </div>
        );
    }

    const addresses = addressesData && addressesData.length > 0 ? addressesData : mockAddresses;

    const items = cartData?.cartItems ?? [];
    const subtotal = items.reduce((sum: number, item: any) => {
        const price = Number(item.product.price) || 0;
        const discountVal = Number(item.product.discountValue) || 0;
        let unitPrice = price;
        if (item.product.discountType === "PERCENT") {
            unitPrice = price - (price * discountVal) / 100;
        } else if (item.product.discountType === "FIXED") {
            unitPrice = price - discountVal;
        }
        return sum + unitPrice * item.quantity;
    }, 0);

    const discountAmount = subtotal * couponDiscount;
    const total = subtotal - discountAmount;

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponCode.trim().toUpperCase();
        if (code === "ROSE50") {
            setAppliedCoupon("ROSE50");
            setCouponDiscount(0.5);
            toast.success(tCart("couponApplied"));
        } else if (code === "ROSE20") {
            setAppliedCoupon("ROSE20");
            setCouponDiscount(0.2);
            toast.success(tCart("couponApplied"));
        } else {
            toast.error(tCart("invalidCoupon"));
        }
    };

    const handleOpenAddressModal = () => {
        if (addresses.length === 0) {
            setModalView("form");
        } else {
            setModalView("list");
        }
        setFormStep(1);
        setEditingAddressId(null);
        setIsAddressModalOpen(true);
    };

    const handleCloseAddressModal = () => {
        setIsAddressModalOpen(false);
        setModalView("list");
        setFormStep(1);
        setEditingAddressId(null);
        setNewAddressTitle("");
        setNewAddressCity("");
        setNewAddressStreet("");
        setNewAddressPhone("");
    };

    const handleOpenAddAddressForm = () => {
        setEditingAddressId(null);
        setNewAddressTitle("Home");
        setNewAddressCity("");
        setNewAddressStreet("");
        setNewAddressPhone("");
        setFormStep(1);
        setModalView("form");
    };

    const handleOpenEditAddressForm = (address: any) => {
        setEditingAddressId(address.id);
        setNewAddressTitle(address.title);
        setNewAddressCity(address.city);
        setNewAddressStreet(address.street);
        setNewAddressPhone(address.phone);
        setFormStep(1);
        setModalView("form");
    };

    const handleDeleteAddressClick = (id: string) => {
        setAddressToDeleteId(id);
    };

    const handleConfirmDeleteAddress = () => {
        if (!addressToDeleteId) return;

        const id = addressToDeleteId;
        if (id.startsWith("mock-address-")) {
            setMockAddresses((prev) => {
                const updated = prev.filter((addr) => addr.id !== id);
                if (selectedAddressId === id) {
                    if (updated.length > 0) {
                        setSelectedAddressId(updated[0].id);
                    } else {
                        setSelectedAddressId("");
                    }
                }
                return updated;
            });
            toast.success(locale === "ar" ? "تم حذف العنوان بنجاح!" : "Address deleted successfully!");
            setAddressToDeleteId(null);
        } else {
            deleteAddressMutation.mutate(id, {
                onSuccess: () => {
                    toast.success(locale === "ar" ? "تم حذف العنوان بنجاح!" : "Address deleted successfully!");
                    if (selectedAddressId === id) {
                        const remaining = (addressesData || []).filter((addr: any) => addr.id !== id);
                        if (remaining.length > 0) {
                            setSelectedAddressId(remaining[0].id);
                        } else {
                            setSelectedAddressId("");
                        }
                    }
                    setAddressToDeleteId(null);
                },
                onError: (err: any) => {
                    toast.error(err.message || "Failed to delete address");
                    setAddressToDeleteId(null);
                },
            });
        }
    };

    const handleSaveAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddressTitle || !newAddressCity || !newAddressStreet || !newAddressPhone) {
            toast.error(locale === "ar" ? "برجاء ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
            return;
        }

        if (editingAddressId) {
            if (editingAddressId.startsWith("mock-address-")) {
                setMockAddresses((prev) =>
                    prev.map((addr) =>
                        addr.id === editingAddressId
                            ? {
                                ...addr,
                                title: newAddressTitle,
                                city: newAddressCity,
                                street: newAddressStreet,
                                phone: newAddressPhone,
                            }
                            : addr
                    )
                );
                toast.success(locale === "ar" ? "تم تعديل العنوان بنجاح!" : "Address updated successfully!");
                setModalView("list");
                setEditingAddressId(null);
            } else {
                updateAddressMutation.mutate(
                    {
                        id: editingAddressId,
                        body: {
                            title: newAddressTitle,
                            city: newAddressCity,
                            street: newAddressStreet,
                            phone: newAddressPhone,
                        },
                    },
                    {
                        onSuccess: () => {
                            toast.success(locale === "ar" ? "تم تعديل العنوان بنجاح!" : "Address updated successfully!");
                            setModalView("list");
                            setEditingAddressId(null);
                        },
                        onError: (err: any) => {
                            toast.error(err.message || "Failed to update address");
                        },
                    }
                );
            }
        } else {
            if (addressesData) {
                createAddressMutation.mutate(
                    {
                        title: newAddressTitle,
                        city: newAddressCity,
                        street: newAddressStreet,
                        phone: newAddressPhone,
                    },
                    {
                        onSuccess: (newAddr) => {
                            toast.success(locale === "ar" ? "تم حفظ العنوان بنجاح!" : "Address saved successfully!");
                            setSelectedAddressId(newAddr.id);
                            setModalView("list");
                        },
                        onError: (err: any) => {
                            toast.error(err.message || "Failed to save address");
                        },
                    }
                );
            } else {
                const newId = `mock-address-${Date.now()}`;
                setMockAddresses((prev) => [
                    ...prev,
                    {
                        id: newId,
                        title: newAddressTitle,
                        city: newAddressCity,
                        street: newAddressStreet,
                        phone: newAddressPhone,
                        isPrimary: false,
                    },
                ]);
                setSelectedAddressId(newId);
                toast.success(locale === "ar" ? "تم حفظ العنوان بنجاح!" : "Address saved successfully!");
                setModalView("list");
            }
        }
    };

    const saveOrderLocally = (orderId: string) => {
        const mockOrder = {
            id: orderId,
            createdAt: new Date().toISOString(),
            total: total,
            paymentStatus: paymentMethod === "CREDIT_CARD" ? "SUCCEEDED" : "PENDING",
            status: "PROCESSING",
            paymentMethod: paymentMethod,
            deliveryStatus: "PENDING",
            items: items.map((item: any) => {
                const price = Number(item.product.price) || 0;
                const discountVal = Number(item.product.discountValue) || 0;
                let unitPrice = price;
                if (item.product.discountType === "PERCENT") {
                    unitPrice = price - (price * discountVal) / 100;
                } else if (item.product.discountType === "FIXED") {
                    unitPrice = price - discountVal;
                }
                return {
                    id: `mock-item-${item.id}`,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: unitPrice,
                    product: {
                        title: item.product.title,
                        image: item.product.cover,
                        rating: 5,
                        reviewsCount: 4,
                    }
                };
            })
        };

        const existingMockOrders = localStorage.getItem("mock_orders");
        let parsedOrders = [];
        if (existingMockOrders) {
            try {
                parsedOrders = JSON.parse(existingMockOrders);
                if (!Array.isArray(parsedOrders)) parsedOrders = [];
            } catch (e) {
                console.error("Failed to parse existing mock orders", e);
            }
        }
        parsedOrders.unshift(mockOrder);
        localStorage.setItem("mock_orders", JSON.stringify(parsedOrders));
    };

    const handleFinalizeCheckout = () => {
        if (!selectedAddressId) {
            toast.error(locale === "ar" ? "برجاء تحديد عنوان الشحن أولاً" : "Please select a shipping address first");
            return;
        }

        const isMockAddress = selectedAddressId.startsWith("mock-address-");

        const orderBody = {
            addressId: selectedAddressId,
            paymentMethod,
            couponCode: appliedCoupon || undefined,
        };

        if (isMockAddress) {
            const toastId = toast.loading(
                paymentMethod === "CREDIT_CARD"
                    ? t("redirectingStripe")
                    : (locale === "ar" ? "جاري إتمام الطلب..." : "Finalizing order...")
            );

            setTimeout(() => {
                const generatedId = `mock-order-${Math.floor(10000 + Math.random() * 90000)}`;
                saveOrderLocally(generatedId);

                clearCartMutation.mutate(undefined, {
                    onSuccess: () => {
                        toast.dismiss(toastId);
                        toast.success(t("orderSuccess"));
                        router.push("/profile/orders");
                    },
                    onError: () => {
                        toast.dismiss(toastId);
                        toast.success(t("orderSuccess"));
                        router.push("/profile/orders");
                    }
                });
            }, paymentMethod === "CREDIT_CARD" ? 2000 : 800);
            return;
        }

        if (paymentMethod === "CREDIT_CARD") {
            const toastId = toast.loading(t("redirectingStripe"));
            setTimeout(() => {
                createOrderMutation.mutate(orderBody, {
                    onSuccess: (newOrder: any) => {
                        saveOrderLocally(newOrder?.id || `order-${Date.now()}`);
                        toast.dismiss(toastId);
                        toast.success(t("orderSuccess"));
                        router.push("/profile/orders");
                    },
                    onError: (err: any) => {
                        toast.dismiss(toastId);
                        toast.error(err.message || "Checkout failed");
                    },
                });
            }, 2000);
        } else {
            createOrderMutation.mutate(orderBody, {
                onSuccess: (newOrder: any) => {
                    saveOrderLocally(newOrder?.id || `order-${Date.now()}`);
                    toast.success(t("orderSuccess"));
                    router.push("/profile/orders");
                },
                onError: (err: any) => {
                    toast.error(err.message || "Checkout failed");
                },
            });
        }
    };

    const recommendedProducts = productsData?.data?.slice(0, 8) || [];
    const scrollSlider = (direction: "left" | "right") => {
        if (recommendedSliderRef.current) {
            const scrollAmount = 318;
            const target = direction === "left" ? recommendedSliderRef.current.scrollLeft - scrollAmount : recommendedSliderRef.current.scrollLeft + scrollAmount;
            recommendedSliderRef.current.scrollTo({ left: target, behavior: "smooth" });
        }
    };

    return (
        <div className="flex flex-col items-center p-0 gap-[50px] w-full max-w-[1280px] mx-auto mt-[40px] mb-[64px] text-start">

            <div className="flex flex-col lg:flex-row items-start p-0 gap-[40px] w-full shrink-0">

                {/* Left Side: Steps and Form */}
                <div className="flex flex-col items-start p-0 gap-[24px] w-full lg:w-[782px] shrink-0">

                    {/* Stepper */}
                    <div className="relative flex flex-row items-center w-full lg:w-[782px] h-[25px] shrink-0 mx-auto lg:mx-0 isolate">
                        {/* Base Background Line (Line 11) - Full Width (782px) with 6px height */}
                        <div className="absolute left-0 right-0 h-[6px] bg-[#E4E4E7] dark:bg-zinc-800 rounded-full z-0" />

                        {/* Active Progress Line - Moves dynamically or stops at Step 1 position */}
                        <div
                            className="absolute left-0 h-[6px] bg-[#A6252A] rounded-full z-0 transition-all duration-500"
                            style={{ width: step === 1 ? '225px' : '575px' }}
                        />

                        {/* Step 1 Circle Indicator - Positioned at 225px from left */}
                        <div
                            className="absolute z-10 flex justify-center items-center w-[25px] h-[25px] bg-[#A6252A] rounded-full text-white font-mulish font-semibold text-[14px]"
                            style={{ left: '225px' }}
                        >
                            1
                        </div>

                        {/* Step 2 Circle Indicator - Positioned at 575px from left (225px + 350px) */}
                        <div
                            className={`absolute z-10 flex justify-center items-center w-[25px] h-[25px] rounded-full font-mulish font-semibold text-[14px] transition-colors ${step === 2 ? 'bg-[#A6252A] text-white' : 'bg-[#E4E4E7] dark:bg-zinc-800 text-[#71717A]'
                                }`}
                            style={{ left: '575px' }}
                        >
                            2
                        </div>
                    </div>

                    {step === 1 ? (
                        <>
                            <h2 className="font-sarabun font-semibold text-[30px] leading-none text-[#000000] dark:text-zinc-100 w-full">
                                {t("shippingAddress") || "Shipping Address"}
                            </h2>

                            {/* Address List */}
                            <div className="flex flex-col items-end p-0 gap-[12px] w-full lg:w-[782px] shrink-0 rounded-[12px]">
                                {addresses.map((address: any) => {
                                    const isSelected = selectedAddressId === address.id;
                                    return (
                                        <button
                                            key={address.id}
                                            onClick={() => setSelectedAddressId(address.id)}
                                            className={`box-border flex flex-col items-start p-[14px_16px] gap-[6px] w-full min-h-[91px] border rounded-[12px] text-start transition-all cursor-pointer outline-none ${isSelected
                                                ? "bg-[#A6252A] border-[#A6252A]"
                                                : "bg-white dark:bg-zinc-900 border-[#D4D4D8] dark:border-zinc-700 hover:border-[#A6252A] dark:hover:border-[#A6252A]"
                                                }`}
                                        >
                                            <div className="flex flex-row justify-between items-center p-0 gap-[10px] w-full lg:w-[750px] min-h-[33px] shrink-0">
                                                <span className={`font-sarabun font-semibold text-[24px] leading-none ${isSelected ? "text-[#FAFAFA]" : "text-[#27272A] dark:text-zinc-100"}`}>
                                                    {address.city}
                                                </span>
                                                <div className="flex flex-row items-center p-0 gap-[6px] h-[33px] shrink-0">
                                                    <div className={`flex justify-center items-center p-0 gap-[10px] w-[33px] h-[33px] rounded-full shrink-0 ${isSelected ? "bg-[#FAFAFA] text-[#A6252A]" : "bg-[#A6252A] text-white"}`}>
                                                        <PhoneIcon className="w-[20px] h-[20px] shrink-0" />
                                                    </div>
                                                    <span className={`font-sarabun font-medium text-[18px] leading-none ${isSelected ? "text-[#FAFAFA]" : "text-[#71717A] dark:text-zinc-400"}`}>
                                                        {address.phone}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`flex flex-row justify-center items-center px-[12px] py-[4px] gap-[10px] h-[24px] rounded-full shrink-0 ${isSelected ? "bg-[#27272A] dark:bg-zinc-950 text-[#FAFAFA]" : "bg-[#F4F4F5] dark:bg-zinc-800 text-[#27272A] dark:text-zinc-200"}`}>
                                                <span className="font-sarabun font-medium text-[16px] leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px] sm:max-w-none">
                                                    {address.street}, {address.city}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* OR Divider */}
                                <div className="flex flex-row items-center py-[9px] px-0 gap-[10px] w-full h-[36px] shrink-0">
                                    <div className="flex-1 border-t border-[#F4F4F5] dark:border-zinc-800" />
                                    <span className="font-sarabun font-semibold text-[18px] leading-none text-[#71717A] dark:text-zinc-500 uppercase">
                                        OR
                                    </span>
                                    <div className="flex-1 border-t border-[#F4F4F5] dark:border-zinc-800" />
                                </div>

                                {/* Add New Address Button */}
                                <button
                                    onClick={handleOpenAddressModal}
                                    className="flex flex-row justify-center items-center p-[14px_16px] gap-[10px] w-full lg:w-[782px] h-[44px] bg-[#FBEAEA] hover:opacity-80 rounded-[10px] transition-opacity outline-none border-none cursor-pointer shrink-0"
                                >
                                    <span className="font-sarabun font-medium text-[16px] leading-none text-[#A6252A]">
                                        {t("addAddress") || "Add a New Address"}
                                    </span>
                                </button>
                            </div>

                            {/* Next Button */}
                            <div className="w-full flex justify-end">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-[152px] h-[41px] bg-[#A6252A] hover:bg-[#8B1E22] rounded-[10px] transition-colors border-none outline-none cursor-pointer"
                                >
                                    <span className="font-mulish font-semibold text-[14px] leading-[150%] text-white">
                                        {t("next") || "Next"}
                                    </span>
                                    <ArrowRight className="w-[20px] h-[20px] text-white rtl:rotate-180 shrink-0" strokeWidth={1.5} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-6 w-full">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-1 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer border-none"
                                >
                                    <ChevronLeft className="size-4 rtl:rotate-180" />
                                    <span>{t("back")}</span>
                                </button>
                                <h2 className="font-sarabun font-bold text-[30px] leading-none text-[#000000] dark:text-zinc-100">
                                    {t("paymentMethod")}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
                                <button
                                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                                    className={`flex flex-col items-center p-6 rounded-2xl text-center border transition-all cursor-pointer bg-white dark:bg-zinc-900 ${paymentMethod === "CASH_ON_DELIVERY"
                                        ? "border-[#A6252A] ring-1 ring-[#A6252A]"
                                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        }`}
                                >
                                    <img src="/icons/cash.svg" alt="Cash on Delivery" className="w-[80px] h-[60px] object-contain shrink-0" />
                                    <h3 className="font-sarabun font-bold text-lg text-zinc-900 dark:text-zinc-100 mt-4">
                                        {t("cashOnDelivery")}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                                        {t("cashOnDeliveryDesc")}
                                    </p>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                                    className={`flex flex-col items-center p-6 rounded-2xl text-center border transition-all cursor-pointer bg-white dark:bg-zinc-900 ${paymentMethod === "CREDIT_CARD"
                                        ? "border-[#A6252A] ring-1 ring-[#A6252A]"
                                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        }`}
                                >
                                    <img src="/icons/credit.svg" alt="Credit Card" className="w-[80px] h-[60px] object-contain shrink-0" />
                                    <h3 className="font-sarabun font-bold text-lg text-zinc-900 dark:text-zinc-100 mt-4">
                                        {t("creditCard")}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                                        {t("creditCardDesc")}
                                    </p>
                                </button>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleFinalizeCheckout}
                                    disabled={createOrderMutation.isPending}
                                    className="flex flex-row justify-center items-center px-[16px] py-[10px] gap-[10px] w-[152px] h-[41px] bg-[#A6252A] hover:bg-[#8B1E22] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[10px] transition-colors cursor-pointer border-none"
                                >
                                    {createOrderMutation.isPending ? (
                                        <Loader2 className="w-[20px] h-[20px] animate-spin" />
                                    ) : (
                                        <>
                                            <span className="font-mulish font-semibold text-[14px] leading-[150%]">{t("checkout")}</span>
                                            <ArrowRight className="w-[20px] h-[20px] rtl:rotate-180" strokeWidth={1.5} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Summary Sidebar */}
                <div className="flex flex-col items-start p-0 gap-[24px] w-full lg:w-[458px] min-h-[605px] shrink-0 border-radius-[12px] lg:sticky lg:top-24">
                    <h2 className="font-sarabun font-semibold text-[30px] leading-none text-[#000000] dark:text-zinc-100">
                        {tCart("summaryTitle")}
                    </h2>

                    <div className="flex flex-col items-start p-[16px] gap-[10px] w-full lg:w-[458px] bg-[#FAFAFA] dark:bg-zinc-900 rounded-[8px] shrink-0">

                        {/* Coupon Form */}
                        <form onSubmit={handleApplyCoupon} className="flex flex-row items-start p-0 gap-[10px] w-full lg:w-[426px] h-[49px] shrink-0">
                            <div className="box-border flex flex-col items-start p-0 gap-[6px] w-[257px] h-[49px] shrink-0">
                                <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] shrink-0">
                                    <input
                                        type="text"
                                        placeholder={tCart("couponPlaceholder")}
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-[159px] h-[49px] bg-[#A6252A] hover:bg-[#8B1E22] rounded-[10px] transition-colors cursor-pointer border-none outline-none shrink-0"
                            >
                                <Ticket className="w-[24px] h-[24px] text-white shrink-0" strokeWidth={1.5} />
                                <span className="font-mulish font-semibold text-[14px] leading-[150%] text-white whitespace-nowrap">
                                    {tCart("applyCoupon")}
                                </span>
                            </button>
                        </form>

                        {/* Coupons Display */}
                        <div className="box-border flex flex-row justify-center items-center p-[10px] gap-[10px] w-full lg:w-[426px] h-[260px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[6px] shrink-0 bg-transparent">
                            {appliedCoupon ? (
                                <span className="font-sarabun font-semibold text-[16px] leading-[21px] text-[#A6252A] dark:text-rose-400">
                                    {tCart("couponAppliedDisplay", { code: appliedCoupon, percent: (couponDiscount * 100).toFixed(0) })}
                                </span>
                            ) : (
                                <span className="font-sarabun font-normal italic text-[16px] leading-[21px] text-[#A1A1AA]">
                                    {tCart("noCoupons")}
                                </span>
                            )}
                        </div>

                        {/* Total Details */}
                        <div className="flex flex-col justify-end items-start p-[10px] gap-[16px] w-full lg:w-[426px] shrink-0">

                            <div className="flex flex-row justify-between items-center p-0 gap-[10px] w-full h-[22px] shrink-0">
                                <span className="font-sarabun font-medium text-[18px] leading-none text-[#27272A] dark:text-zinc-300">
                                    {tCart("subtotal")}
                                </span>
                                <span className="font-sarabun font-semibold text-[20px] leading-none text-[#27272A] dark:text-zinc-100">
                                    {subtotal.toFixed(2)} EGP
                                </span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex flex-row items-center p-0 gap-[10px] w-full shrink-0">
                                    <div className="flex-1 h-px border-t border-[#D4D4D8] dark:border-zinc-700" />
                                    <span className="font-sarabun font-semibold text-[16px] leading-none text-[#27272A] dark:text-zinc-300 whitespace-nowrap">
                                        {t("discountDisplay", { percent: (couponDiscount * 100).toFixed(0) })}
                                    </span>
                                    <div className="flex-1 h-px border-t border-[#D4D4D8] dark:border-zinc-700" />
                                </div>
                            )}
                            {!appliedCoupon && (
                                <div className="w-full h-px border-t border-[#D4D4D8] dark:border-zinc-700 shrink-0" />
                            )}

                            <div className="flex flex-row justify-between items-center p-0 gap-[10px] w-full h-[24px] shrink-0">
                                <span className="font-sarabun font-bold text-[24px] leading-none text-[#A6252A] dark:text-rose-400">
                                    {tCart("total")}
                                </span>
                                <span className="font-sarabun font-bold text-[24px] leading-none text-[#A6252A] dark:text-rose-400">
                                    {total.toFixed(2)} EGP
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Related Products Section ── */}
            {recommendedProducts.length > 0 && (
                <div className="flex flex-col items-start p-[10px] gap-[24px] w-full max-w-[1280px] shrink-0 text-start relative mt-[16px]">

                    {/* Heading Component */}
                    <div className="relative w-[367px] h-[41px] shrink-0 ml-[10px]">
                        <div className="absolute w-[214px] h-[17px] left-0 top-[24px] bg-[#FFE0E7] dark:bg-[#741C21]/40 rounded-r-[20px]" />
                        <div className="absolute w-[83px] h-[2px] left-0 top-[39px] bg-[#E65073]" />
                        <h2 className="absolute w-[367px] h-[36px] left-0 top-0 font-sarabun font-bold text-[36px] leading-none text-[#741C21] dark:text-rose-300 flex items-center z-10 m-0">
                            {tCart("recommendedTitle")}
                        </h2>
                    </div>

                    <div className="relative w-full flex items-center justify-center">
                        <button
                            onClick={() => scrollSlider("left")}
                            className="absolute top-[146px] -translate-y-1/2 -left-[16px] z-10 flex flex-col justify-center items-center w-[33px] h-[33px] bg-[#A6252A] rounded-full hover:bg-[#8B1E22] transition-colors cursor-pointer border-none outline-none shadow-md"
                        >
                            <ChevronLeft className="w-[20px] h-[20px] text-white rtl:rotate-180" strokeWidth={2} />
                        </button>

                        <div
                            ref={recommendedSliderRef}
                            className="flex flex-row items-start p-[10px] gap-[16px] overflow-x-auto scroll-smooth w-full max-w-[1260px] mx-auto isolate [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {recommendedProducts.map((recProduct) => (
                                <div key={recProduct.id} className="shrink-0 z-0">
                                    <ProductCard product={recProduct} />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollSlider("right")}
                            className="absolute top-[146px] -translate-y-1/2 -right-[16px] z-10 flex flex-col justify-center items-center w-[33px] h-[33px] bg-[#A6252A] rounded-full hover:bg-[#8B1E22] transition-colors cursor-pointer border-none outline-none shadow-md"
                        >
                            <ChevronRight className="w-[20px] h-[20px] text-white rtl:rotate-180" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Address Dialog Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className={`bg-white dark:bg-zinc-900 rounded-[16px] w-full shadow-2xl p-[24px] relative flex flex-col font-sarabun text-start transition-all duration-300 max-w-[850px] ${modalView === "list" ? "min-h-[567px] gap-[36px]" : "h-[659px] gap-[16px] overflow-hidden"}`}>

                        {modalView === "list" ? (
                            <>
                                <div className="box-border flex flex-row justify-between items-center w-full pb-[16px] border-b border-[#E4E4E7] dark:border-zinc-800 shrink-0">
                                    <h3 className="font-sarabun font-bold text-[30px] leading-none text-[#27272A] dark:text-zinc-100 m-0">
                                        {t("myAddresses") || "My Addresses"}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleOpenAddAddressForm}
                                            className="flex flex-row justify-center items-center px-[16px] py-[14px] h-[44px] bg-[#FBEAEA] hover:opacity-80 rounded-[10px] transition-opacity cursor-pointer border-none outline-none shrink-0"
                                        >
                                            <span className="font-sarabun font-medium text-[16px] leading-none text-[#A6252A]">
                                                {t("addAddress") || "Add a New Address"}
                                            </span>
                                        </button>
                                        <button
                                            onClick={handleCloseAddressModal}
                                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500 shrink-0"
                                        >
                                            <X className="w-[20px] h-[20px]" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-[36px] w-full pr-[18px] rtl:pr-0 rtl:pl-[18px] max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-hide pt-[16px] pb-[16px]">
                                    {addresses.map((address: any) => {
                                        const isSelected = selectedAddressId === address.id;
                                        return (
                                            <div
                                                key={address.id}
                                                onClick={() => {
                                                    setSelectedAddressId(address.id);
                                                    setIsAddressModalOpen(false);
                                                }}
                                                className={`relative box-border flex flex-col items-start p-[24px_36px_20px_16px] gap-[16px] w-full min-h-[117px] rounded-[12px] text-start transition-all cursor-pointer outline-none isolate ${isSelected
                                                    ? "border border-[#A6252A] bg-white dark:bg-zinc-900"
                                                    : "border border-[#D4D4D8] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#A6252A]/50"
                                                    }`}
                                            >
                                                <div className="absolute flex flex-row justify-center items-center px-[10px] py-[6px] h-[36px] left-[12px] rtl:left-auto rtl:right-[12px] top-[-18px] bg-white dark:bg-zinc-900 z-10">
                                                    <span className="font-sarabun font-semibold text-[24px] leading-none text-[#A6252A]">
                                                        {address.title}
                                                    </span>
                                                </div>

                                                <div className="absolute flex flex-col items-start gap-[6px] w-[36px] right-[-18px] rtl:right-auto rtl:left-[-18px] top-1/2 -translate-y-1/2 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEditAddressForm(address);
                                                        }}
                                                        className="box-border flex flex-row justify-center items-center w-[36px] h-[36px] bg-[#FAFAFA] dark:bg-zinc-800 border border-[#A1A1AA] dark:border-zinc-600 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer outline-none m-0 p-0"
                                                    >
                                                        <Pencil className="w-[18px] h-[18px] text-[#3F3F46] dark:text-zinc-300" strokeWidth={1.5} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAddressClick(address.id);
                                                        }}
                                                        className="flex flex-row justify-center items-center w-[36px] h-[36px] bg-[#DC2626] hover:bg-[#B91C1C] rounded-full transition-colors cursor-pointer border-none outline-none m-0 p-0"
                                                    >
                                                        <Trash2 className="w-[18px] h-[18px] text-white" strokeWidth={1.5} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-row justify-between items-start w-full gap-[10px] z-10">
                                                    <div className="flex flex-row items-center gap-[10px] h-[33px]">
                                                        <div className="flex justify-center items-center w-[33px] h-[33px] bg-[#00BC7D] rounded-full shrink-0">
                                                            <MapPin className="w-[20px] h-[20px] text-white" strokeWidth={1.5} />
                                                        </div>
                                                        <span className="font-sarabun font-semibold text-[24px] leading-none text-[#27272A] dark:text-zinc-100">
                                                            {address.city}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-row items-center gap-[10px] h-[33px] pr-[16px] rtl:pr-0 rtl:pl-[16px]">
                                                        <Phone className="w-[20px] h-[20px] text-[#27272A] dark:text-zinc-300 shrink-0" strokeWidth={1.5} />
                                                        <span className="font-sarabun font-medium text-[18px] leading-none text-[#52525B] dark:text-zinc-400" dir="ltr">
                                                            {address.phone}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-start z-10">
                                                    <div className="flex flex-row justify-center items-center px-[12px] py-[4px] gap-[10px] h-[24px] bg-[#F4F4F5] dark:bg-zinc-800 rounded-full">
                                                        <span className="font-sarabun font-medium text-[16px] leading-none text-[#27272A] dark:text-zinc-200">
                                                            {address.street}, {address.city}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Form Header */}
                                <div className="flex flex-col gap-[24px] w-full shrink-0">
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <h3 className="font-sarabun font-bold text-[30px] leading-none text-[#27272A] dark:text-zinc-100 m-0">
                                            {editingAddressId
                                                ? (t("editAddressTitle") || "Edit Address")
                                                : (t("addAddressTitle") || "Add a New Address")}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleCloseAddressModal}
                                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500 shrink-0"
                                        >
                                            <X className="w-[20px] h-[20px]" />
                                        </button>
                                    </div>

                                    {/* Steps Bar */}
                                    <div className="relative flex flex-row items-center w-full h-[25px] shrink-0 isolate">
                                        {/* Base Background Line (Line 11) */}
                                        <div className="absolute left-0 right-0 h-[6px] bg-[#E4E4E7] dark:bg-zinc-800 rounded-full z-0" />
                                        
                                        {/* Active Progress Line */}
                                        <div
                                            className="absolute left-0 h-[6px] bg-[#A6252A] rounded-full z-0 transition-all duration-300"
                                            style={{ width: formStep === 1 ? '225px' : '575px' }}
                                        />
                                        
                                        {/* Step 1 Circle */}
                                        <div
                                            className="absolute z-10 flex justify-center items-center w-[25px] h-[25px] bg-[#A6252A] text-white rounded-full font-mulish font-semibold text-[14px]"
                                            style={{ left: '225px' }}
                                        >
                                            1
                                        </div>
                                        
                                        {/* Step 2 Circle */}
                                        <div
                                            className={`absolute z-10 flex justify-center items-center w-[25px] h-[25px] rounded-full font-mulish font-semibold text-[14px] transition-colors ${
                                                formStep === 2 ? 'bg-[#A6252A] text-white' : 'bg-[#E4E4E7] dark:bg-zinc-800 text-[#71717A]'
                                            }`}
                                            style={{ left: '575px' }}
                                        >
                                            2
                                        </div>
                                    </div>
                                </div>

                                {/* Step Subtitle & Divider */}
                                <div className="box-border flex flex-row items-center gap-[12px] pb-[12px] border-b border-[#E4E4E7] dark:border-zinc-800 w-full shrink-0">
                                    {formStep === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormStep(1)}
                                            className="flex justify-center items-center w-[36px] h-[36px] bg-[#A6252A] hover:bg-[#8B1E22] rounded-full transition-colors cursor-pointer border-none outline-none"
                                        >
                                            <ChevronLeft className="w-[20px] h-[20px] text-white rtl:rotate-180" strokeWidth={2.5} />
                                        </button>
                                    )}
                                    <span className="font-sarabun font-bold text-[24px] leading-none text-[#A6252A] dark:text-rose-400">
                                        {formStep === 1
                                            ? (locale === "ar" ? "أدخل تفاصيل العنوان" : "Enter address details")
                                            : (locale === "ar" ? "تحديد موقعك" : "Find Your Location")}
                                    </span>
                                </div>

                                <form onSubmit={handleSaveAddressSubmit} className="flex flex-col gap-[16px] w-full shrink-0 animate-fade-in">
                                    {formStep === 1 ? (
                                        <>
                                            {/* City */}
                                            <div className="flex flex-col gap-[6px] w-full">
                                                <label className="text-[14px] font-medium text-[#27272A] dark:text-zinc-300 font-inter">
                                                    {locale === "ar" ? "المدينة" : "City"}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAddressCity}
                                                    onChange={(e) => setNewAddressCity(e.target.value)}
                                                    placeholder={locale === "ar" ? "أدخل اسم المدينة" : "Enter city name"}
                                                    className="h-[49px] p-[16px] bg-white dark:bg-zinc-900 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] text-[14px] font-inter outline-none focus:border-[#A6252A] transition-colors text-zinc-800 dark:text-zinc-100 placeholder-[#A1A1AA] w-full"
                                                    required
                                                />
                                            </div>

                                            {/* Address */}
                                            <div className="flex flex-col gap-[6px] w-full">
                                                <label className="text-[14px] font-medium text-[#27272A] dark:text-zinc-300 font-inter">
                                                    {locale === "ar" ? "العنوان" : "Address"}
                                                </label>
                                                <textarea
                                                    value={newAddressStreet}
                                                    onChange={(e) => setNewAddressStreet(e.target.value)}
                                                    placeholder={locale === "ar" ? "أدخل عنوانك بالتفصيل" : "Enter your full address"}
                                                    className="h-[150px] min-h-[150px] p-[16px] bg-white dark:bg-zinc-900 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] text-[14px] font-inter outline-none focus:border-[#A6252A] transition-colors text-zinc-800 dark:text-zinc-100 placeholder-[#A1A1AA] w-full resize-none"
                                                    required
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div className="flex flex-col gap-[6px] w-full relative">
                                                <label className="text-[14px] font-medium text-[#27272A] dark:text-zinc-300 font-inter">
                                                    {locale === "ar" ? "الهاتف" : "Phone"}
                                                </label>
                                                <PhoneInput
                                                    id="phone"
                                                    value={newAddressPhone}
                                                    onChange={(val) => setNewAddressPhone(val)}
                                                    placeholder={locale === "ar" ? "رقم الهاتف" : "Phone number"}
                                                    hasError={false}
                                                />
                                            </div>

                                            {/* Next Button Container */}
                                            <div className="flex flex-col justify-end items-end p-0 gap-[10px] w-full mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!newAddressCity || !newAddressStreet || !newAddressPhone) {
                                                            toast.error(locale === "ar" ? "برجاء ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
                                                            return;
                                                        }
                                                        setFormStep(2);
                                                    }}
                                                    className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-full h-[50px] bg-[#A6252A] hover:bg-[#8B1E22] text-white rounded-[10px] cursor-pointer border-none transition-colors"
                                                >
                                                    <span className="font-sarabun font-medium text-[16px] leading-none text-white">
                                                        {locale === "ar" ? "التالي" : "Next"}
                                                    </span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Select Address Label */}
                                            <div className="flex flex-col gap-[6px] w-full">
                                                <label className="text-[14px] font-medium text-[#27272A] dark:text-zinc-300 font-inter">
                                                    {locale === "ar" ? "تصنيف العنوان" : "Address Label"}
                                                </label>
                                                <div className="grid grid-cols-3 gap-3 w-full">
                                                    {["Home", "Work", "Family"].map((labelName) => {
                                                        const isLabelSelected = newAddressTitle === labelName;
                                                        const labelDisplay = locale === "ar"
                                                            ? (labelName === "Home" ? "منزل" : labelName === "Work" ? "عمل" : "عائلة")
                                                            : labelName;
                                                        return (
                                                            <button
                                                                key={labelName}
                                                                type="button"
                                                                onClick={() => setNewAddressTitle(labelName)}
                                                                className={`h-[49px] border rounded-[10px] text-center font-bold text-[14px] cursor-pointer transition-colors ${
                                                                    isLabelSelected
                                                                        ? "border-[#A6252A] bg-[#A6252A] text-white"
                                                                        : "border-[#D4D4D8] dark:border-zinc-800 hover:border-[#A6252A]/50 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                                                                }`}
                                                            >
                                                                {labelDisplay}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Google Maps Container */}
                                            <div className="relative w-full h-[240px] rounded-[16px] overflow-hidden border border-[#D4D4D8] dark:border-zinc-800 z-0">
                                                <div id="google-map-container" className="w-full h-full" />

                                                {/* Find My Location Overlay Button */}
                                                <button
                                                    type="button"
                                                    onClick={handleGeolocateUser}
                                                    className="absolute top-4 right-4 z-[1000] flex flex-row items-center gap-[8px] px-[16px] py-[10px] h-[40px] bg-white hover:bg-zinc-50 text-[#A6252A] border border-[#A6252A] rounded-[8px] shadow-md transition-colors cursor-pointer font-sarabun font-bold text-[14px] outline-none"
                                                >
                                                    <Locate className="w-[16px] h-[16px] text-[#A6252A]" />
                                                    <span>{locale === "ar" ? "تحديد موقعي" : "Find My Location"}</span>
                                                </button>
                                            </div>

                                            {/* Submit/Add Address Button */}
                                            <div className="flex flex-col justify-end items-end p-0 gap-[10px] w-full mt-2">
                                                <button
                                                    type="submit"
                                                    disabled={createAddressMutation.isPending || updateAddressMutation.isPending || isGeocoding}
                                                    className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-full h-[50px] bg-[#A6252A] hover:bg-[#8B1E22] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[10px] cursor-pointer border-none transition-colors outline-none"
                                                >
                                                    {(createAddressMutation.isPending || updateAddressMutation.isPending || isGeocoding) && (
                                                        <Loader2 className="w-[18px] h-[18px] animate-spin text-white" />
                                                    )}
                                                    <span className="font-sarabun font-medium text-[16px] leading-none text-white">
                                                        {editingAddressId
                                                            ? (locale === "ar" ? "تعديل العنوان" : "Edit Address")
                                                            : (locale === "ar" ? "إضافة العنوان" : "Add Address")}
                                                    </span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
 
            {/* Delete Confirmation Modal */}
            {addressToDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] max-w-sm w-full shadow-2xl p-6 relative flex flex-col items-center gap-5 text-center font-sarabun">
                        <button
                            onClick={() => setAddressToDeleteId(null)}
                            className="absolute top-4 right-4 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500"
                        >
                            <X className="w-[20px] h-[20px]" />
                        </button>
 
                        <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex justify-center items-center mt-2">
                            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex justify-center items-center text-zinc-500 dark:text-zinc-400">
                                <Trash2 className="w-6 h-6" />
                            </div>
                        </div>
 
                        <span className="font-sarabun font-bold text-[18px] text-zinc-800 dark:text-zinc-100 leading-snug px-2">
                            {t("deleteConfirm") || "Are you sure you want to delete this address?"}
                        </span>
 
                        <div className="flex flex-row gap-3 w-full mt-2">
                            <button
                                type="button"
                                onClick={() => setAddressToDeleteId(null)}
                                className="flex-1 py-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-[16px] font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer bg-white dark:bg-transparent transition-colors"
                            >
                                {tCommon("cancel") || "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteAddress}
                                disabled={deleteAddressMutation.isPending}
                                className="flex-1 py-3 bg-[#E53935] hover:bg-[#D32F2F] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-[16px] font-semibold text-white cursor-pointer border-none transition-colors flex justify-center items-center gap-2"
                            >
                                {deleteAddressMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{locale === "ar" ? "تأكيد" : "Confirm"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

