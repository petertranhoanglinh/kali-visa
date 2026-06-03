import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, combineLatestWith } from 'rxjs/operators';

import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { AssetModel, AssetType } from 'src/app/model/asset.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { AssetService } from 'src/app/service/asset.service';
import { AssetRuleService } from 'src/app/service/asset-rule.service';
import { RebalanceReport } from 'src/app/model/asset-rule.model';

import { loadPortfolioData, loadRealtimePrices } from 'src/app/actions/portfolio.actions';
import {
  selectAssets,
  selectMergedPriceMap,
  selectExchangeRate,
  selectIsLoading,
  selectIsLoaded,
} from 'src/app/selectors/portfolio.selector';

@Component({
  selector: 'app-portfolio-dashboard',
  templateUrl: './portfolio-dashboard.component.html',
  styleUrls: ['./portfolio-dashboard.component.css']
})
export class PortfolioDashboardComponent implements OnInit, OnDestroy {

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

  // Chart Properties
  public chartLabels: string[] = ['Vàng (GOLD)', 'Chứng Khoán (STOCK)', 'Coin (CRYPTO)', 'Tiền Mặt (CASH)', 'Trái Phiếu (BOND)', 'Quỹ Mở (FUND)'];
  public chartData: ChartData<'doughnut'> = {
    labels: this.chartLabels,
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6366f1', '#0ea5e9'],
      hoverBackgroundColor: ['#d97706', '#2563eb', '#7c3aed', '#059669', '#4f46e5', '#0284c7'],
      borderWidth: 0
    }]
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

  private destroy$ = new Subject<void>();
  private EXCHANGE_RATE = 25000;

  constructor(
    private store: Store,
    private assetService: AssetService,
    private ruleService: AssetRuleService,
  ) {}

  ngOnInit(): void {
    const userInfo = AuthDetail.getLoginedInfo();
    const now = new Date();
    const expiryDate = userInfo.expiryDate ? new Date(userInfo.expiryDate) : null;
    const isExpired = expiryDate ? expiryDate < now : true;
    this.isPremium = (userInfo.tier === 'PRO' || userInfo.tier === 'PREMIUM' || userInfo.tier === 'PLUS' || userInfo.role === 'ADMIN') && !isExpired;
    if (userInfo && userInfo.role === 'ADMIN') this.isPremium = true;
    this.currentUser = userInfo;

    // Dispatch load — Effect tự kiểm tra cache, chỉ gọi API nếu chưa loaded
    this.store.dispatch(loadPortfolioData());

    // Theo dõi loading state
    this.store.select(selectIsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    // Khi data loaded xong → tính metrics + trigger realtime nếu PRO
    this.store.select(selectIsLoaded)
      .pipe(
        takeUntil(this.destroy$),
        filter(loaded => loaded),
        combineLatestWith(
          this.store.select(selectAssets),
          this.store.select(selectExchangeRate)
        )
      )
      .subscribe(([, assets, rate]) => {
        this.EXCHANGE_RATE = rate;
        if (this.isPremium) {
          this._dispatchRealtimePrices(assets);
        }
        this.checkRules();
      });

    // Theo dõi merged price map → recalculate khi có giá mới
    this.store.select(selectAssets)
      .pipe(
        takeUntil(this.destroy$),
        combineLatestWith(this.store.select(selectMergedPriceMap))
      )
      .subscribe(([assets, priceMap]) => {
        if (assets.length > 0) {
          this.calculateMetrics(assets, priceMap);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _dispatchRealtimePrices(assets: AssetModel[]) {
    const uniqueSymbols = Array.from(new Set(assets.map(a => a.symbol)));
    const automatedSymbols = uniqueSymbols.filter(s => {
      const first = assets.find(a => a.symbol === s);
      return first && (first.type === AssetType.STOCK || first.type === AssetType.CRYPTO);
    });

    if (automatedSymbols.length > 0) {
      const types = automatedSymbols.map(
        sym => assets.find(a => a.symbol === sym)?.type || 'STOCK'
      );
      this.store.dispatch(loadRealtimePrices({ symbols: automatedSymbols, types }));
    }
  }

  checkRules() {
    this.ruleService.analyzePortfolio().subscribe({
      next: (res) => {
        if (res && res.analysis) {
          this.violatedRules = res.analysis.filter((r: any) => r.isViolated);
        } else {
          this.violatedRules = [];
        }
      }
    });
  }

  private calculateMetrics(assets: AssetModel[], priceMap: Map<string, number>) {
    let totalValVND = 0;
    let totalCstVND = 0;

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
      } else {
        summary.quantity += q;
        summary.costBasis += (q * p);
      }
    });

    const categoryTotals = new Map<string, number>();
    Object.values(AssetType).forEach(type => categoryTotals.set(type, 0));

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

    this.chartData = {
      ...this.chartData,
      datasets: [{
        ...this.chartData.datasets[0],
        data: [
          categoryTotals.get(AssetType.GOLD) || 0,
          categoryTotals.get(AssetType.STOCK) || 0,
          categoryTotals.get(AssetType.CRYPTO) || 0,
          categoryTotals.get(AssetType.CASH) || 0,
          categoryTotals.get(AssetType.BOND) || 0,
          categoryTotals.get(AssetType.FUND) || 0,
        ]
      }]
    };
  }

  toggleIncognito(): void {
    this.isIncognito = !this.isIncognito;
  }
}
