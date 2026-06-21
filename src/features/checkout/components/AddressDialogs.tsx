"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Pencil, Trash2, MapPin, Phone, ChevronLeft, Loader2, Locate } from "lucide-react";
import { toast } from "sonner";
import { Address } from "@/features/addresses/types";
import { PhoneInput } from "@/shared/ui/phone-input";
import {
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress
} from "@/features/addresses/hooks";

const CAIRO_DEFAULT_LATITUDE = 30.0444;
const CAIRO_DEFAULT_LONGITUDE = 31.2357;
const GOOGLE_MAPS_DEFAULT_ZOOM = 13;
const GOOGLE_MAPS_GEOLOCATED_ZOOM = 16;

declare global {
    interface Window {
        google?: {
            maps: {
                Map: new (
                    element: HTMLElement,
                    options: {
                        center: { lat: number; lng: number };
                        zoom: number;
                        mapTypeControl: boolean;
                        streetViewControl: boolean;
                        fullscreenControl: boolean;
                    }
                ) => {
                    setCenter: (latLng: { lat: number; lng: number }) => void;
                    setZoom: (zoom: number) => void;
                    addListener: (
                        event: string,
                        callback: (event: { latLng: { lat: () => number; lng: () => number } }) => void
                    ) => void;
                };
                Marker: new (options: {
                    position: { lat: number; lng: number };
                    map: unknown;
                    draggable: boolean;
                }) => {
                    setPosition: (latLng: { lat: number; lng: number }) => void;
                    getPosition: () => { lat: () => number; lng: () => number } | null | undefined;
                    addListener: (event: string, callback: () => void) => void;
                };
                Geocoder: new () => {
                    geocode: (
                        request: { location?: { lat: number; lng: number }; address?: string },
                        callback: (
                            results:
                                | {
                                      address_components: { types: string[]; long_name: string }[];
                                      formatted_address: string;
                                      geometry?: {
                                          location?: {
                                              lat?: () => number;
                                              lng?: () => number;
                                          };
                                      };
                                  }[]
                                | null,
                            status: string
                        ) => void
                    ) => void;
                };
            };
        };
    }
}

interface AddressDialogsProps {
    isOpen: boolean;
    onClose: () => void;
    addresses: Address[];
    selectedAddressId: string;
    onSelectAddress: (id: string) => void;
    onAddressUpdated: () => void;
    isGoogleMapsLoaded: boolean;
    createAddressMutation: ReturnType<typeof useCreateAddress>;
    updateAddressMutation: ReturnType<typeof useUpdateAddress>;
    deleteAddressMutation: ReturnType<typeof useDeleteAddress>;
}

export function AddressDialogs({
    isOpen,
    onClose,
    addresses,
    selectedAddressId,
    onSelectAddress,
    onAddressUpdated,
    isGoogleMapsLoaded,
    createAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
}: AddressDialogsProps) {
    const t = useTranslations("checkout");
    const tCommon = useTranslations("common");

    const [modalView, setModalView] = useState<"list" | "form">("list");
    const [formStep, setFormStep] = useState<1 | 2>(1);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);
    const [newAddressTitle, setNewAddressTitle] = useState("");
    const [newAddressCity, setNewAddressCity] = useState("");
    const [newAddressStreet, setNewAddressStreet] = useState("");
    const [newAddressPhone, setNewAddressPhone] = useState("");

    const [isGeocoding, setIsGeocoding] = useState(false);
    const mapRef = useRef<unknown>(null);
    const markerRef = useRef<{
        setPosition: (latLng: { lat: number; lng: number }) => void;
        getPosition: () => { lat: () => number; lng: () => number } | null | undefined;
    } | null>(null);

    const isDeleteAddressPending = deleteAddressMutation.isPending;
    const isSaveAddressPending = createAddressMutation.isPending || updateAddressMutation.isPending;

    const handleCloseAddressModal = () => {
        setModalView("list");
        setFormStep(1);
        setEditingAddressId(null);
        setNewAddressTitle("");
        setNewAddressCity("");
        setNewAddressStreet("");
        setNewAddressPhone("");
        onClose();
    };

    const handleConfirmDeleteAddress = () => {
        if (!addressToDeleteId) return;

        const id = addressToDeleteId;
        deleteAddressMutation.mutate(id, {
            onSuccess: () => {
                toast.success(t("addressDeleted") || "Address deleted successfully");
                if (selectedAddressId === id) {
                    const remaining = addresses.filter((addr) => addr.id !== id);
                    if (remaining.length > 0) {
                        onSelectAddress(remaining[0].id);
                    } else {
                        onSelectAddress("");
                    }
                }
                onAddressUpdated();
                setAddressToDeleteId(null);
            },
            onError: (error: unknown) => {
                const message = error instanceof Error ? error.message : "Failed to delete address";
                toast.error(message);
                setAddressToDeleteId(null);
            },
        });
    };

    const handleSaveAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddressTitle || !newAddressCity || !newAddressStreet || !newAddressPhone) {
            toast.error(t("fillError"));
            return;
        }

        if (editingAddressId) {
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
                        toast.success(t("addressUpdated") || "Address updated successfully");
                        setModalView("list");
                        setEditingAddressId(null);
                        onAddressUpdated();
                    },
                    onError: (error: unknown) => {
                        const message = error instanceof Error ? error.message : "Failed to update address";
                        toast.error(message);
                    },
                }
            );
        } else {
            createAddressMutation.mutate(
                {
                    title: newAddressTitle,
                    city: newAddressCity,
                    street: newAddressStreet,
                    phone: newAddressPhone,
                },
                {
                    onSuccess: (newAddr) => {
                        toast.success(t("addressSaved") || "Address saved successfully");
                        onSelectAddress(newAddr.id);
                        setModalView("list");
                        onAddressUpdated();
                    },
                    onError: (error: unknown) => {
                        const message = error instanceof Error ? error.message : "Failed to save address";
                        toast.error(message);
                    },
                }
            );
        }
    };

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        setIsGeocoding(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
            );
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

    const geocodeCoords = (lat: number, lng: number) => {
        if (!window.google || !window.google.maps) {
            fetchAddressFromCoords(lat, lng);
            return;
        }

        setIsGeocoding(true);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
                let city = "";
                let street = "";
                const addressComponents = results[0].address_components;

                for (const component of addressComponents) {
                    const types = component.types;
                    if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                        city = component.long_name;
                    } else if (
                        types.includes("route") ||
                        types.includes("sublocality") ||
                        types.includes("neighborhood")
                    ) {
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
                console.warn("Google reverse geocoding failed, falling back to OSM. Status:", status);
                fetchAddressFromCoords(lat, lng);
            }
        });
    };

    const handleGeolocateUser = () => {
        if (!navigator.geolocation) {
            toast.error(t("geolocationUnsupported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const googleMaps = window.google?.maps;
                if (mapRef.current && markerRef.current && googleMaps) {
                    const pos = { lat: latitude, lng: longitude };
                    const typedMap = mapRef.current as {
                        setCenter: (latLng: { lat: number; lng: number }) => void;
                        setZoom: (zoom: number) => void;
                    };
                    typedMap.setCenter(pos);
                    typedMap.setZoom(GOOGLE_MAPS_GEOLOCATED_ZOOM);
                    markerRef.current.setPosition(pos);
                    geocodeCoords(latitude, longitude);
                }
            },
            (error) => {
                toast.error(t("geolocationFailed"));
                console.error("Geolocation error:", error);
            }
        );
    };

    useEffect(() => {
        if (!isGoogleMapsLoaded || formStep !== 2 || typeof window === "undefined" || !window.google) {
            return;
        }

        const googleMaps = window.google.maps;
        const defaultLat = CAIRO_DEFAULT_LATITUDE;
        const defaultLng = CAIRO_DEFAULT_LONGITUDE;
        const mapContainer = document.getElementById("google-map-container");

        if (!mapContainer) return;

        const map = new googleMaps.Map(mapContainer, {
            center: { lat: defaultLat, lng: defaultLng },
            zoom: GOOGLE_MAPS_DEFAULT_ZOOM,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        const marker = new googleMaps.Marker({
            position: { lat: defaultLat, lng: defaultLng },
            map: map,
            draggable: true,
        });

        mapRef.current = map;
        markerRef.current = marker;

        marker.addListener("dragend", () => {
            const pos = marker.getPosition();
            if (pos) {
                geocodeCoords(pos.lat(), pos.lng());
            }
        });

        map.addListener("click", (event) => {
            if (event.latLng) {
                const clickPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
                marker.setPosition(clickPos);
                geocodeCoords(clickPos.lat, clickPos.lng);
            }
        });

        const locateOrFallback = () => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const pos = { lat: latitude, lng: longitude };
                    map.setCenter(pos);
                    map.setZoom(GOOGLE_MAPS_GEOLOCATED_ZOOM);
                    marker.setPosition(pos);
                    geocodeCoords(latitude, longitude);
                },
                () => {
                    geocodeCoords(defaultLat, defaultLng);
                }
            );
        };

        if (editingAddressId && newAddressCity) {
            const geocoder = new googleMaps.Geocoder();
            geocoder.geocode({ address: `${newAddressStreet}, ${newAddressCity}` }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                    const location = {
                        lat: results[0].geometry?.location?.lat?.() || defaultLat,
                        lng: results[0].geometry?.location?.lng?.() || defaultLng,
                    };
                    map.setCenter(location);
                    map.setZoom(GOOGLE_MAPS_GEOLOCATED_ZOOM);
                    marker.setPosition(location);
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
    }, [isGoogleMapsLoaded, formStep]);

    if (!isOpen) return null;

    const handleOpenAddForm = () => {
        setEditingAddressId(null);
        setNewAddressTitle("Home");
        setNewAddressCity("");
        setNewAddressStreet("");
        setNewAddressPhone("");
        setFormStep(1);
        setModalView("form");
    };

    const handleOpenEditForm = (address: Address) => {
        setEditingAddressId(address.id);
        setNewAddressTitle(address.title);
        setNewAddressCity(address.city);
        setNewAddressStreet(address.street);
        setNewAddressPhone(address.phone);
        setFormStep(1);
        setModalView("form");
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div
                    className={`relative flex w-full max-w-[850px] flex-col rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-zinc-900 ${
                        modalView === "list" ? "min-h-[567px] gap-9" : "h-[659px] gap-4 overflow-hidden"
                    }`}
                >
                    {modalView === "list" ? (
                        <>
                            <div className="flex w-full flex-row justify-between items-center border-b border-zinc-200 pb-4 dark:border-zinc-800">
                                <h3 className="m-0 font-sarabun text-3xl font-bold leading-none text-zinc-800 dark:text-zinc-100">
                                    {t("myAddresses") || "My Addresses"}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleOpenAddForm}
                                        className="flex h-11 cursor-pointer flex-row justify-center items-center rounded-lg border-none bg-rose-50 px-4 py-3.5 transition-colors hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40"
                                    >
                                        <span className="font-sarabun text-base font-medium leading-none text-primary-600">
                                            {t("addAddress") || "Add a New Address"}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseAddressModal}
                                        className="flex cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-2 text-zinc-400 transition-colors hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex w-full flex-col items-start gap-9 overflow-y-auto pr-4.5 py-4 scrollbar-thin scrollbar-hide rtl:pl-4.5 rtl:pr-0">
                                {addresses.map((address) => {
                                    const isSelected = selectedAddressId === address.id;
                                    return (
                                        <div
                                            key={address.id}
                                            onClick={() => {
                                                onSelectAddress(address.id);
                                                handleCloseAddressModal();
                                            }}
                                            className={`relative flex min-h-[117px] w-full cursor-pointer flex-col items-start gap-4 rounded-xl border p-[24px_36px_20px_16px] text-start transition-all outline-none isolate ${
                                                isSelected
                                                    ? "border-primary-600 bg-white dark:bg-zinc-900"
                                                    : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 hover:border-primary-600/50"
                                            }`}
                                        >
                                            <div className="absolute top-[-18px] left-3 z-10 flex h-9 flex-row justify-center items-center bg-white px-2.5 py-1.5 dark:bg-zinc-900 rtl:left-auto rtl:right-3">
                                                <span className="font-sarabun text-2xl font-semibold leading-none text-primary-600">
                                                    {address.title}
                                                </span>
                                            </div>

                                            <div className="absolute top-1/2 right-[-18px] z-20 flex -translate-y-1/2 flex-col items-start gap-1.5 w-9 rtl:left-[-18px] rtl:right-auto">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEditForm(address);
                                                    }}
                                                    className="flex h-9 w-9 cursor-pointer flex-row justify-center items-center rounded-full border border-zinc-400 bg-zinc-50 p-0 outline-none transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                                >
                                                    <Pencil className="h-[18px] w-[18px] text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAddressToDeleteId(address.id);
                                                    }}
                                                    className="flex h-9 w-9 cursor-pointer flex-row justify-center items-center rounded-full border-none bg-red-600 p-0 outline-none transition-colors hover:bg-red-700"
                                                >
                                                    <Trash2 className="h-[18px] w-[18px] text-white" strokeWidth={1.5} />
                                                </button>
                                            </div>

                                            <div className="flex w-full flex-row justify-between items-start gap-2.5 z-10">
                                                <div className="flex h-8 items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00BC7D]">
                                                        <MapPin className="h-5 w-5 text-white" strokeWidth={1.5} />
                                                    </div>
                                                    <span className="font-sarabun text-2xl font-semibold leading-none text-zinc-800 dark:text-zinc-100">
                                                        {address.city}
                                                    </span>
                                                </div>

                                                <div className="flex h-8 items-center gap-2.5 pr-4 rtl:pl-4 rtl:pr-0">
                                                    <Phone className="h-5 w-5 text-zinc-800 dark:text-zinc-300" strokeWidth={1.5} />
                                                    <span className="font-sarabun text-lg font-medium leading-none text-zinc-600 dark:text-zinc-400" dir="ltr">
                                                        {address.phone}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start z-10">
                                                <div className="flex h-6 flex-row justify-center items-center rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
                                                    <span className="font-sarabun text-base font-medium leading-none text-zinc-800 dark:text-zinc-200">
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
                            <div className="flex w-full flex-col gap-6">
                                <div className="flex flex-row justify-between items-center w-full">
                                    <h3 className="m-0 font-sarabun text-3xl font-bold leading-none text-zinc-800 dark:text-zinc-100">
                                        {editingAddressId
                                            ? t("editAddressTitle") || "Edit Address"
                                            : t("addAddressTitle") || "Add a New Address"}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleCloseAddressModal}
                                        className="flex cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-2 text-zinc-400 transition-colors hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="relative flex h-6 w-full items-center">
                                    <div className="absolute inset-x-0 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                    <div
                                        className={`absolute left-0 h-1.5 rounded-full bg-primary-600 transition-all duration-500 ${
                                            formStep === 1 ? "w-1/2" : "w-full"
                                        }`}
                                    />
                                    <div className="absolute left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                                        1
                                    </div>
                                    <div
                                        className={`absolute right-0 z-10 flex h-6 w-6 -translate-x-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                                            formStep === 2
                                                ? "bg-primary-600 text-white"
                                                : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                                        }`}
                                    >
                                        2
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-row items-center gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                                {formStep === 2 && (
                                    <button
                                        type="button"
                                        onClick={() => setFormStep(1)}
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none bg-primary-600 transition-colors hover:bg-primary-700 outline-none"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-white rtl:rotate-180" strokeWidth={2.5} />
                                    </button>
                                )}
                                <span className="font-sarabun text-2xl font-bold leading-none text-primary-600 dark:text-rose-400">
                                    {formStep === 1 ? t("enterAddressDetails") : t("findYourLocation")}
                                </span>
                            </div>

                            <div className="flex w-full flex-col gap-4 animate-fade-in">
                                {formStep === 1 ? (
                                    <>
                                        <div className="flex w-full flex-col gap-1.5">
                                            <label className="font-inter text-sm font-medium text-zinc-800 dark:text-zinc-300">
                                                {t("cityLabel")}
                                            </label>
                                            <input
                                                type="text"
                                                value={newAddressCity}
                                                onChange={(e) => setNewAddressCity(e.target.value)}
                                                placeholder={t("cityPlaceholder")}
                                                className="h-12 w-full rounded-lg border border-zinc-300 bg-white p-4 font-inter text-sm font-normal text-zinc-800 placeholder-zinc-400 outline-none transition-colors focus:border-primary-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                required
                                            />
                                        </div>

                                        <div className="flex w-full flex-col gap-1.5">
                                            <label className="font-inter text-sm font-medium text-zinc-800 dark:text-zinc-300">
                                                {t("streetLabel")}
                                            </label>
                                            <textarea
                                                value={newAddressStreet}
                                                onChange={(e) => setNewAddressStreet(e.target.value)}
                                                placeholder={t("streetPlaceholder")}
                                                className="h-[150px] min-h-[150px] w-full resize-none rounded-lg border border-zinc-300 bg-white p-4 font-inter text-sm font-normal text-zinc-800 placeholder-zinc-400 outline-none transition-colors focus:border-primary-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                required
                                            />
                                        </div>

                                        <div className="relative flex w-full flex-col gap-1.5">
                                            <label className="font-inter text-sm font-medium text-zinc-800 dark:text-zinc-300">
                                                {t("phoneLabel")}
                                            </label>
                                            <PhoneInput
                                                id="phone"
                                                value={newAddressPhone}
                                                onChange={setNewAddressPhone}
                                                placeholder={t("phonePlaceholder")}
                                                hasError={false}
                                            />
                                        </div>

                                        <div className="mt-4 flex w-full flex-col items-end justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!newAddressCity || !newAddressStreet || !newAddressPhone) {
                                                        toast.error(t("fillError"));
                                                        return;
                                                    }
                                                    setFormStep(2);
                                                }}
                                                className="flex h-12 w-full cursor-pointer flex-row justify-center items-center gap-2.5 rounded-lg border-none bg-primary-600 text-white transition-colors hover:bg-primary-700"
                                            >
                                                <span className="font-sarabun text-base font-medium leading-none text-white">
                                                    {t("next")}
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex w-full flex-col gap-1.5">
                                            <label className="font-inter text-sm font-medium text-zinc-800 dark:text-zinc-300">
                                                {t("addressLabel")}
                                            </label>
                                            <div className="grid w-full grid-cols-3 gap-3">
                                                {["Home", "Work", "Family"].map((labelName) => {
                                                    const isLabelSelected = newAddressTitle === labelName;
                                                    const labelDisplay = t(`label${labelName}`);
                                                    return (
                                                        <button
                                                            key={labelName}
                                                            type="button"
                                                            onClick={() => setNewAddressTitle(labelName)}
                                                            className={`h-12 cursor-pointer rounded-lg border text-center text-sm font-bold transition-colors ${
                                                                isLabelSelected
                                                                    ? "border-primary-600 bg-primary-600 text-white"
                                                                    : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:border-primary-600/50"
                                                            }`}
                                                        >
                                                            {labelDisplay}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="relative z-0 h-60 w-full overflow-hidden rounded-2xl border border-zinc-300 dark:border-zinc-800">
                                            <div id="google-map-container" className="h-full w-full" />

                                            <button
                                                type="button"
                                                onClick={handleGeolocateUser}
                                                className="absolute top-4 right-4 z-50 flex h-10 cursor-pointer flex-row items-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-2.5 text-sm font-bold text-primary-600 shadow-md outline-none transition-colors hover:bg-zinc-50"
                                            >
                                                <Locate className="h-4 w-4 text-primary-600" />
                                                <span>{t("findMyLocation")}</span>
                                            </button>
                                        </div>

                                        <div className="mt-2 flex w-full flex-col items-end justify-end">
                                            <button
                                                type="button"
                                                onClick={handleSaveAddressSubmit}
                                                disabled={isSaveAddressPending || isGeocoding}
                                                className="flex h-12 w-full cursor-pointer flex-row justify-center items-center gap-2.5 rounded-lg border-none bg-primary-600 text-white outline-none transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {(isSaveAddressPending || isGeocoding) && (
                                                    <Loader2 className="h-[18px] w-[18px] animate-spin text-white" />
                                                )}
                                                <span className="font-sarabun text-base font-medium leading-none text-white">
                                                    {editingAddressId ? t("editAddressTitle") : t("addAddressTitle")}
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {addressToDeleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="relative flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 font-sarabun font-inter">
                        <button
                            type="button"
                            onClick={() => setAddressToDeleteId(null)}
                            className="absolute top-4 right-4 flex cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-1 text-zinc-400 transition-colors hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                <Trash2 className="h-6 w-6" />
                            </div>
                        </div>

                        <span className="px-2 text-lg font-bold leading-snug text-zinc-800 dark:text-zinc-100">
                            {t("deleteConfirm") || "Are you sure you want to delete this address?"}
                        </span>

                        <div className="mt-2 flex w-full flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => setAddressToDeleteId(null)}
                                className="flex-1 cursor-pointer rounded-xl border border-zinc-300 bg-white py-3 text-base font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                {tCommon("cancel") || "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteAddress}
                                disabled={isDeleteAddressPending}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-red-600 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeleteAddressPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                <span>{t("confirm")}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
