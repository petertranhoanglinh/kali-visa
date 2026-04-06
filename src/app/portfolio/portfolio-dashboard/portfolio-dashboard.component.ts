import { Component, OnInit } from '@angular/core';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { AssetService } from 'src/app/service/asset.service';
import { MarketPriceService } from 'src/app/service/market-price.service';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { AssetModel, AssetType } from 'src/app/model/asset.model';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { MemberModel } from 'src/app/model/member.model';

@Component({
  selector: 'app-portfolio-dashboard',
  templateUrl: './portfolio-dashboard.component.html',
  styleUrls: ['./portfolio-dashboard.component.css']
})
export class PortfolioDashboardComponent implements OnInit {

  isIncognito = false;
  isLoading = false;
  currentUser: any;
  
  // Financial Metrics (VND)
  totalValueVND = 0;
  totalCostVND = 0;
  totalGainVND = 0;
  gainPercent = 0;

  private EXCHANGE_RATE = 25000; // 1 USD = 25,000 VND

  // Chart Properties
  public chartLabels: string[] = ['Crypto', 'Chứng Khoán', 'Vàng', 'Tiền Mặt' , 'Trái Phiếu'];
  public chartData: ChartData<'doughnut'> = {
    labels: this.chartLabels,
    datasets: [
      {
        data: [0, 0, 0, 0, 0], 
        backgroundColor: ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#6366f1'],
        hoverBackgroundColor: ['#7c3aed', '#2563eb', '#d97706', '#059669', '#4f46e5'],
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.refreshUserProfile();
    this.loadData();
  }

  refreshUserProfile() {
    const jwt = AuthDetail.getCookie('jwt');
    if (jwt) {
      this.authService.getProfile(jwt).subscribe({
        next: (res) => {
          if (res.code === 200) {
            this.currentUser = res.data;
            // Optionally update local storage info if needed
          }
        }
      });
    }
  }

  loadData() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) return;

    this.isLoading = true;
    forkJoin({
      assets: this.assetService.getAssetsByUser(userId),
      prices: this.marketPriceService.getPricesByUser(userId)
    }).subscribe({
      next: ({ assets, prices }) => {
        const priceMap = new Map<string, number>();
        prices.forEach(p => priceMap.set(p.symbol, p.price));
        
        this.calculateMetrics(assets, priceMap);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
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
