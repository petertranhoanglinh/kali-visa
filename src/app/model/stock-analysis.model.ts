export interface WhaleFlowData {
    foreignNetBuy: string;
    proprietaryNetBuy: string;
    largeTransactions: string[];
}

export interface ShareholderInfo {
    name: string;
    position: string;
    shareCount: string;
    percentage: string;
    recentTrades?: string[];
}

export interface StockAnalysisResult {
    ticker: string;
    assetType: 'STOCK' | 'CRYPTO';
    currentPrice: string;
    technicalAnalysis: string;
    fundamentalAnalysis: string;
    shareholderAnalysis: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    aiScore: number;
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    targetPrice: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    whaleFlow?: WhaleFlowData;
    shareholders?: ShareholderInfo[];
    technicalIndicators?: { [key: string]: string };
}
