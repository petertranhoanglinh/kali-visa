import { Component, OnInit } from '@angular/core';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { AssetService } from 'src/app/service/asset.service';
import { MarketPriceService } from 'src/app/service/market-price.service';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { AssetModel, AssetType } from 'src/app/model/asset.model';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { MemberModel } from 'src/app/model/member.model';
import { SystemConfigService } from 'src/app/service/system-config.service';
import { AssetRuleService } from 'src/app/service/asset-rule.service';
import { RebalanceReport } from 'src/app/model/asset-rule.model';

@Component({
  selector: 'app-portfolio-dashboard',
  templateUrl: './portfolio-dashboard.component.html',
  styleUrls: ['./portfolio-dashboard.component.css']
})
export class PortfolioDashboardComponent implements OnInit {

  isIncognito = false;
  isLoading = false;
  currentUser: any;
  violatedRules: RebalanceReport[] = [];
  isPremium = false;
  
  // Financial Metrics (VND)
  totalValueVND = 0;
  totalCostVND = 0;
  totalGainVND = 0;
  gainPercent = 0;

  private EXCHANGE_RATE = 25000; // Default fallback

  // Chart Properties
  public chartLabels: string[] = ['Crypto', 'Chứng Khoán', 'Quỹ Mở', 'Vàng', 'Tiền Mặt' , 'Trái Phiếu'];
  public chartData: ChartData<'doughnut'> = {
    labels: this.chartLabels,
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0], 
        backgroundColor: ['#8b5cf6', '#3b82f6', '#f43f5e', '#f59e0b', '#10b981', '#6366f1'],
        hoverBackgroundColor: ['#7c3aed', '#2563eb', '#e11d48', '#d97706', '#059669', '#4f46e5'],
        borderWidth: 0
      }
    ]
  };
  public chartType: 'doughnut' = 'doughnut';
  public chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { family: 'Inter', size: 13 }, color: '#4b5563', usePointStyle: true, padding: 20 }
      }
    }
  };

  constructor(
    private assetService: AssetService,
    private marketPriceService: MarketPriceService,
    private authService: AuthService,
    private configService: SystemConfigService,
    private ruleService: AssetRuleService
  ) { }

  ngOnInit(): void {
    const userInfo = AuthDetail.getLoginedInfo();
    const now = new Date();
    const expiryDate = userInfo.expiryDate ? new Date(userInfo.expiryDate) : null;
    const isExpired = expiryDate ? expiryDate < now : true;
    this.isPremium = (userInfo.tier === 'PRO' || userInfo.tier === 'PREMIUM' || userInfo.tier === 'PLUS' || userInfo.role === 'ADMIN') && !isExpired;
    if (userInfo && userInfo.role === 'ADMIN') this.isPremium = true;

    this.currentUser = userInfo;
    this.loadExchangeRate();
  }

  checkRules() {
    this.ruleService.analyzePortfolio().subscribe({
      next: (res) => {
        if (res && res.analysis) {
          this.violatedRules = res.analysis.filter(r => r.isViolated);
        } else {
          this.violatedRules = [];
        }
      }
    });
  }

 

  loadExchangeRate() {
        this.configService.getConfig('USD_VND_RATE').subscribe({
          next: (res) => {
            if (res && res.configValue) {
              this.EXCHANGE_RATE = Number(res.configValue);
            }
            this.loadData();
          },
          error: () => {
            console.warn('Could not load exchange rate, using default 25,000');
            this.loadData();
          }
        });
      }
    
      loadData() {
        const userId = AuthDetail.getLoginedInfo()?.id;
        if (!userId) return;
    
        this.isLoading = true;
        this.assetService.getAssetsByUser(userId).subscribe({
          next: (assets) => {
            if (this.isPremium) {
            this.refreshProPrices(assets);
           } else {
              this.marketPriceService.getPricesByUser(userId).subscribe({
                next: (prices) => {
                  const priceMap = new Map<string, number>();
                  prices.forEach(p => priceMap.set(p.symbol, p.price));
                  this.calculateMetrics(assets, priceMap);
                  this.checkRules(); // Cập nhật cảnh báo dựa trên giá vừa load
                  this.isLoading = false;
                },
                error: () => {
                  this.calculateMetrics(assets, new Map());
                  this.checkRules();
                  this.isLoading = false;
                }
              });
            }
          },
          error: () => this.isLoading = false
        });
      }
    
      refreshProPrices(assets: AssetModel[]) {
        const uniqueSymbols = Array.from(new Set(assets.map(a => a.symbol)));
        const automatedSymbols = uniqueSymbols.filter(s => {
          const firstAsset = assets.find(a => a.symbol === s);
          if (!firstAsset) return false;
          // Automate STOCK, CRYPTO, FUND, and SJC Gold
          if (firstAsset.type === AssetType.GOLD && s !== 'SJC') return false; 
          if (firstAsset.type === AssetType.CASH || firstAsset.type === AssetType.BOND) return false;
          return true;
        });
    
        const types = automatedSymbols.map(sym => assets.find(a => a.symbol === sym)?.type || 'STOCK');
    
        if (automatedSymbols.length === 0) {
          this.calculateMetrics(assets, new Map());
          this.isLoading = false;
          return;
        }
    
        this.assetService.getRealtimePrices(automatedSymbols, types).subscribe({
          next: (priceMap) => {
            const mPriceMap = new Map<string, number>();
            Object.keys(priceMap).forEach(sym => mPriceMap.set(sym, priceMap[sym]));
            this.calculateMetrics(assets, mPriceMap);
            this.checkRules(); // Cập nhật cảnh báo dựa trên giá Realtime vừa lấy
            this.isLoading = false;
          },
          error: () => {
            this.calculateMetrics(assets, new Map());
            this.checkRules();
            this.isLoading = false;
          }
        });
      }

  private calculateMetrics(assets: AssetModel[], priceMap: Map<string, number>) {
    let totalValVND = 0;
    let totalCstVND = 0;
    
    // 1. Group quantities and costs by symbol first
    const symbolSummaries = new Map<string, { quantity: number; costBasis: number; type: AssetType; currency: string }>();

    assets.forEach(asset => {
      const q = asset.quantity || 0;
      const p = asset.averagePrice || 0;
      const symbol = asset.symbol;
      
      if (!symbolSummaries.has(symbol)) {
        symbolSummaries.set(symbol, { quantity: 0, costBasis: 0, type: asset.type, currency: asset.currency || 'USD' });
      }
      
      const summary = symbolSummaries.get(symbol)!;
      if (asset.isSell) {
        summary.quantity -= q;
        // Selling doesn't change the cost basis per unit of remaining assets in this simplified model,
        // but we need to track total cost of remaining inventory.
      } else {
        summary.quantity += q;
        summary.costBasis += (q * p);
      }
    });

    const categoryTotals = new Map<string, number>();
    Object.values(AssetType).forEach(type => categoryTotals.set(type, 0));

    // 2. Calculate values based on remaining inventory
    symbolSummaries.forEach((summary, symbol) => {
      if (summary.quantity <= 0 && summary.type !== AssetType.CASH) return;

      const avgPrice = summary.quantity > 0 ? (summary.costBasis / summary.quantity) : summary.costBasis;
      const currentPrice = priceMap.get(symbol) || avgPrice;
      
      let assetValue = summary.quantity * currentPrice;
      let assetCost = summary.quantity * avgPrice;

      if (summary.currency === 'USD') {
        assetValue *= this.EXCHANGE_RATE;
        assetCost *= this.EXCHANGE_RATE;
      }

      totalValVND += assetValue;
      if (summary.type !== AssetType.CASH) {
        totalCstVND += assetCost;
      }

      const currentCatVal = categoryTotals.get(summary.type) || 0;
      categoryTotals.set(summary.type, currentCatVal + assetValue);
    });

    this.totalValueVND = totalValVND;
    this.totalCostVND = totalCstVND;
    this.totalGainVND = totalValVND - totalCstVND;
    this.gainPercent = totalCstVND > 0 ? (this.totalGainVND / totalCstVND) : 0;

    // Update Chart
    this.chartData = {
      ...this.chartData,
      datasets: [{
        ...this.chartData.datasets[0],
        data: [
          categoryTotals.get(AssetType.CRYPTO) || 0,
          categoryTotals.get(AssetType.STOCK) || 0,
          categoryTotals.get(AssetType.FUND) || 0,
          categoryTotals.get(AssetType.GOLD) || 0,
          categoryTotals.get(AssetType.CASH) || 0,
          categoryTotals.get(AssetType.BOND) || 0
        ]
      }]
    };
  }

  toggleIncognito(): void {
    this.isIncognito = !this.isIncognito;
  }

}
