"use client";

import {  useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    useAddresses,
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress,
} from "@/features/addresses/hooks";
import { useCart, useClearCart } from "@/features/cart/hooks";
import { useCreateOrder } from "@/features/orders/hooks";
import { useProducts } from "@/features/products/hooks";
import { Loader2 } from "lucide-react";
import { ShippingAddressStep } from "@/features/checkout/components/ShippingAddressStep";
import { PaymentStep } from "@/features/checkout/components/PaymentStep";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { AddressDialogs } from "@/features/checkout/components/AddressDialogs";
import { RecommendedSection } from "@/features/checkout/components/RecommendedSection";
import { useSelectedAddress } from "@/features/checkout/hooks/use-selected-address";
import { calculateSubtotal, calculateTotal } from "@/features/checkout/utils/checkout";

const STRIPE_REDIRECT_DELAY_MS = 2000;
const COUPON_DISCOUNT_ROSE50 = 0.5;
const COUPON_DISCOUNT_ROSE20 = 0.2;

export default function CheckoutPage() {
    const router = useRouter();
    const t = useTranslations("checkout");
    const tCart = useTranslations("cart");
    const tCommon = useTranslations("common");
    const { status } = useSession();

    const { data: addressesData, isLoading: isAddressesLoading } = useAddresses();
    const { data: cartData, isLoading: isCartLoading } = useCart();
    const { data: productsData } = useProducts({ limit: 10 });

    const createAddressMutation = useCreateAddress();
    const updateAddressMutation = useUpdateAddress();
    const deleteAddressMutation = useDeleteAddress();
    const createOrderMutation = useCreateOrder();
    const clearCartMutation = useClearCart();

    const [step, setStep] = useState<1 | 2>(1);
    const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "CREDIT_CARD">("CASH_ON_DELIVERY");

    const addresses = addressesData || [];
    const { selectedAddressId, selectAddress } = useSelectedAddress(addresses);

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(() => {
        return typeof window !== "undefined" && !!window.google?.maps;
    });

    useEffect(() => {
        if (typeof window !== "undefined" && selectedAddressId) {
            const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
            if (selectedAddress?.city) {
                localStorage.setItem("selected_address_city", selectedAddress.city);
            } else {
                localStorage.removeItem("selected_address_city");
            }
            window.dispatchEvent(new Event("addressChanged"));
        }
    }, [selectedAddressId, addresses]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (window.google?.maps) {
            return;
        }

        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
            const handleLoad = () => setIsGoogleMapsLoaded(true);
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
            setIsGoogleMapsLoaded(true);
        };
        document.head.appendChild(script);
    }, []);

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);

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

    if (status === "loading" || isCartLoading || isAddressesLoading) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                <span className="font-sarabun text-sm text-zinc-500 dark:text-zinc-400">
                    {tCommon("loading")}
                </span>
            </div>
        );
    }

    const cartItems = cartData?.cartItems ?? [];

    const subtotal = calculateSubtotal(cartItems);
    const discountAmount = subtotal * couponDiscount;
    const total = calculateTotal(subtotal, discountAmount);

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponCode.trim().toUpperCase();
        if (code === "ROSE50") {
            setAppliedCoupon("ROSE50");
            setCouponDiscount(COUPON_DISCOUNT_ROSE50);
            toast.success(tCart("couponApplied"));
        } else if (code === "ROSE20") {
            setAppliedCoupon("ROSE20");
            setCouponDiscount(COUPON_DISCOUNT_ROSE20);
            toast.success(tCart("couponApplied"));
        } else {
            toast.error(tCart("invalidCoupon"));
        }
    };

    const handleOpenAddressModal = () => {
        setIsAddressModalOpen(true);
    };

    const handleCloseAddressModal = () => {
        setIsAddressModalOpen(false);
    };

    const handleFinalizeCheckout = () => {
        if (!selectedAddressId) {
            toast.error(t("selectAddressFirst"));
            return;
        }

        const orderBody = {
            addressId: selectedAddressId,
            paymentMethod,
            couponCode: appliedCoupon || undefined,
        };

        if (paymentMethod === "CREDIT_CARD") {
            const toastId = toast.loading(t("redirectingStripe"));
            setTimeout(() => {
                createOrderMutation.mutate(orderBody, {
                    onSuccess: (newOrder) => {
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
                            },
                        });
                    },
                    onError: (error: unknown) => {
                        toast.dismiss(toastId);
                        const message = error instanceof Error ? error.message : "Checkout failed";
                        toast.error(message);
                    },
                });
            }, STRIPE_REDIRECT_DELAY_MS);
        } else {
            createOrderMutation.mutate(orderBody, {
                onSuccess: (newOrder) => {
                    clearCartMutation.mutate(undefined, {
                        onSuccess: () => {
                            toast.success(t("orderSuccess"));
                            router.push("/profile/orders");
                        },
                        onError: () => {
                            toast.success(t("orderSuccess"));
                            router.push("/profile/orders");
                        },
                    });
                },
                onError: (error: unknown) => {
                    const message = error instanceof Error ? error.message : "Checkout failed";
                    toast.error(message);
                },
            });
        }
    };

    const recommendedProducts = productsData?.data?.slice(0, 8) || [];

    return (
        <div className="mx-auto mt-10 mb-16 flex w-full max-w-7xl flex-col items-center gap-12.5 p-0 text-start">
            <div className="flex w-full flex-col lg:flex-row items-start gap-10 p-0 shrink-0">
                <div className="flex w-full flex-col items-start gap-6 lg:w-195.5 shrink-0">
                    <div className="relative flex h-6 w-full items-center">
                        <div className="absolute inset-x-0 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        <div
                            className={`absolute left-0 h-1.5 rounded-full bg-primary-600 transition-all duration-500 ${
                                step === 1 ? "w-1/2" : "w-full"
                            }`}
                        />
                        <div className="absolute left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                            1
                        </div>
                        <div
                            className={`absolute right-0 z-10 flex h-6 w-6 translate-x-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                                step === 2
                                    ? "bg-primary-600 text-white"
                                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                            }`}
                        >
                            2
                        </div>
                    </div>

                    {step === 1 ? (
                        <ShippingAddressStep
                            addresses={addresses}
                            selectedAddressId={selectedAddressId}
                            onSelectAddress={selectAddress}
                            onOpenAddressModal={handleOpenAddressModal}
                            onNextStep={() => setStep(2)}
                        />
                    ) : (
                        <PaymentStep
                            paymentMethod={paymentMethod}
                            onSelectPaymentMethod={setPaymentMethod}
                            onBackStep={() => setStep(1)}
                            onFinalizeCheckout={handleFinalizeCheckout}
                            isPending={createOrderMutation.isPending}
                        />
                    )}
                </div>

                <div className="sticky top-24 flex w-full flex-col items-start gap-6 lg:w-114.5">
                    <CheckoutSummary
                        subtotal={subtotal}
                        discountAmount={discountAmount}
                        total={total}
                        couponCode={couponCode}
                        onCouponCodeChange={setCouponCode}
                        appliedCoupon={appliedCoupon}
                        couponDiscount={couponDiscount}
                        onApplyCoupon={handleApplyCoupon}
                    />
                </div>
            </div>

            <RecommendedSection recommendedProducts={recommendedProducts} />

            <AddressDialogs
                isOpen={isAddressModalOpen}
                onClose={handleCloseAddressModal}
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={selectAddress}
                onAddressUpdated={() => {}}
                isGoogleMapsLoaded={isGoogleMapsLoaded}
                createAddressMutation={createAddressMutation}
                updateAddressMutation={updateAddressMutation}
                deleteAddressMutation={deleteAddressMutation}
            />
        </div>
    );
}
