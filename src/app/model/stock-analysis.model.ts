export interface StockAnalysisResult {
    ticker: string;
    assetType: string;
    currentPrice: string;
    
    // AI Content
    technicalAnalysis: string;
    fundamentalAnalysis: string;
    shareholderAnalysis: string;
    overviewAnalysis?: string;
    masterAnalysis?: string;
    
    // Metrics
    sentiment: string;
    aiScore: number;
    recommendation: string;
    targetPrice: string;
    riskLevel: string;
    
    // Raw Data (vnstock)
    overview?: any;
    finance?: any;
    shareholders?: any[];
    insiderDeals?: any[];
    technicals?: any[];
    companyNews?: any[];
    
    whaleFlow?: any;
    latestIndicators?: any;
    macroContext?: any;
}
