export enum AssetType {
    GOLD = 'GOLD',
    STOCK = 'STOCK',
    CRYPTO = 'CRYPTO',
    CASH = 'CASH',
    BOND = 'BOND',
}

export interface AssetModel {
    id?: string;
    userId: string;
    type: AssetType;
    symbol: string;
    quantity: number;
    averagePrice: number;
    currency?: string;
    isSell?: boolean;
    purchaseDate?: string;
    updatedAt?: string;
}
