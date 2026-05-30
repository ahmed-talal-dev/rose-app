export type Address = {
    id: string;
    title: string;
    isPrimary: boolean;
    city: string;
    street: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt: string;
};

export type CreateAddressInput = {
    title: string;
    isPrimary?: boolean;
    city: string;
    street: string;
    phone: string;
    latitude?: number;
    longitude?: number;
};

export type UpdateAddressInput = Partial<CreateAddressInput>;