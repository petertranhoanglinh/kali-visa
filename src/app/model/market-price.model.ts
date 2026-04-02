export interface MarketPriceModel {
    id?: string;
    userId: string;
    symbol: string;
    price: number;
    currency?: string;
    updatedAt?: string;
}
