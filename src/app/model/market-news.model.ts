export interface MarketNews {
    id?: string;
    title: string;
    content: string;
    summary: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    aiScore: number;
    category: string;
    sourceUrl?: string;
    createdAt: Date;
}

export interface NewsResponse {
    content: MarketNews[];
    totalElements: number;
    totalPages: number;
    last: boolean;
}
