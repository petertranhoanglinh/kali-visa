export interface AssetRule {
    id?: string;
    userId?: string;
    assetType: string;
    symbol?: string;
    targetPercentage: number;
    thresholdPercent: number;
    ruleName: string;
    isActive: boolean;
    createdAt?: string;
}

export interface RebalanceAnalysis {
    totalValue: number;
    analysis: RebalanceReport[];
}

export interface RebalanceReport {
    ruleName: string;
    assetType: string;
    currentPercent: number;
    targetPercent: number;
    deviation: number;
    isViolated: boolean;
}
