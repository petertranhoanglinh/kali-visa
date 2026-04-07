import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from 'src/app/service/analytics.service';
import { StockAnalysisResult } from '../../model/stock-analysis.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { AuthDetail } from 'src/app/common/util/auth-detail';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  ticker: string = '';
  tickerInput: string = '';
  loading: boolean = false;
  isAnalyzing: boolean = false;
  activeTab: string = 'OVERVIEW';
  analysisResult: StockAnalysisResult | null = null;
  isPremium: boolean = false;

  // Chart Properties
  public priceChartType: ChartType = 'line';
  public priceChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Giá Đóng Cửa', 
        borderColor: '#6366f1', 
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2
      },
      { 
        data: [], 
        label: 'SMA 20', 
        borderColor: '#f59e0b', 
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.3
      },
      { 
        data: [], 
        label: 'SMA 50', 
        borderColor: '#ef4444', 
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.3
      },
      { 
        data: [], 
        label: 'SMA 200', 
        borderColor: '#10b981', 
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.3
      }
    ]
  };

  public priceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#475569', font: { weight: '600' } } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: '600' } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { weight: '600' } } }
    }
  };

  setTab(tab: string) {
    this.activeTab = tab;
    const techs = this.analysisResult?.technicals;
    if (tab === 'TECHNICAL' && techs && techs.length > 0) {
      setTimeout(() => this.updatePriceChart(techs), 50);
    }
  }

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    const userInfo = AuthDetail.getLoginedInfo();
    const now = new Date();
    const expiryDate = userInfo.expiryDate ? new Date(userInfo.expiryDate) : null;
    const isExpired = expiryDate ? expiryDate < now : true;

    // Chỉ PRO hoặc ADMIN (và chưa hết hạn) mới được dùng
    this.isPremium = (userInfo.tier === 'PRO' || userInfo.tier === 'PLUS' || userInfo.role === 'ADMIN') && !isExpired;
    
    // Nếu là ADMIN thì luôn bypass expiry
    if (userInfo.role === 'ADMIN') this.isPremium = true;

    this.route.queryParams.subscribe(params => {
      this.ticker = params['ticker'];
      if (this.ticker) {
        this.performAnalysis();
      } else {
        this.analysisResult = null;
      }
    });
  }

  performAnalysis() {
    if (this.tickerInput) {
      this.ticker = this.tickerInput;
    }
    
    if (!this.ticker) return;

    this.loading = true;
    this.isAnalyzing = true;
    this.analyticsService.analyzeTicker(this.ticker).subscribe({
      next: (res) => {
        this.analysisResult = res;
        this.loading = false;
        this.isAnalyzing = false;
        if (res.technicals && res.technicals.length > 0) {
          this.updatePriceChart(res.technicals);
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.isAnalyzing = false;
      }
    });
  }

  private updatePriceChart(technicals: any[]) {
    // Technicals contains Daily history from Python
    const labels = technicals.map(t => {
      const d = new Date(t.time);
      return isNaN(d.getTime()) ? t.time : d.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'});
    });
    
    const prices = technicals.map(t => t.close);
    const sma20 = technicals.map(t => t.sma20);
    const sma50 = technicals.map(t => t.sma50);
    const sma200 = technicals.map(t => t.sma200);

    this.priceChartData.labels = labels;
    this.priceChartData.datasets[0].data = prices;
    this.priceChartData.datasets[1].data = sma20;
    this.priceChartData.datasets[2].data = sma50;
    this.priceChartData.datasets[3].data = sma200;
    
    this.priceChartData = { ...this.priceChartData };
  }

  getSentimentColor(sentiment: string): string {
    switch (sentiment?.toUpperCase()) {
      case 'BULLISH': return '#10b981';
      case 'BEARISH': return '#ef4444';
      default: return '#f59e0b';
    }
  }

  getRiskColor(risk: string): string {
    switch (risk?.toUpperCase()) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      default: return '#94a3b8';
    }
  }
}
