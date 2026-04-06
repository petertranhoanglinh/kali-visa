import { Component, OnInit } from '@angular/core';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { AnalyticsService } from 'src/app/service/analytics.service';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { StockAnalysisResult } from 'src/app/model/stock-analysis.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  // Premium State
  isPremium = false;
  userTier = 'BASIC';
  
  // UI State
  activeTab: 'DASHBOARD' | 'TECHNICAL' | 'FUNDAMENTAL' | 'SHAREHOLDERS' = 'DASHBOARD';

  // Search State
  tickerInput = '';
  isAnalyzing = false;
  analysisResult: StockAnalysisResult | null = null;

  // 1. Whale Tracker Chart (Bar Chart)
  public whaleChartType: 'bar' = 'bar';
  public whaleChartData: ChartData<'bar'> = {
    labels: ['VCB', 'SSI', 'HSG', 'Hpg', 'VHM', 'MWG'],
    datasets: [
      {
        label: 'Tự Doanh Bán Ròng (Tỷ VNĐ)',
        data: [-120, -50, -32, 0, 0, 0],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: '#ef4444',
      },
      {
        label: 'Khối Ngoại Mua Ròng (Tỷ VNĐ)',
        data: [0, 0, 0, 85, 150, 310],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
      }
    ]
  };
  public whaleChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    },
    plugins: { legend: { labels: { color: '#f8fafc' } } }
  };

  // 2. Stress Test Chart (Line Chart)
  public stressChartType: 'line' = 'line';
  public stressChartData: ChartData<'line'> = {
    labels: ['T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Today', 'T+1', 'T+2', 'T+3'],
    datasets: [
      {
        label: 'Dự báo Bình thường',
        data: [1200, 1220, 1250, 1240, 1260, 1250, 1265, 1280, 1300],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Giả lập Khủng hoảng',
        data: [1200, 1220, 1250, 1240, 1260, 1250, 1000, 950, 880],
        borderColor: '#f43f5e',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };
  public stressChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    },
    plugins: { legend: { labels: { color: '#f8fafc' } } }
  };

  constructor(
    private analyticsService: AnalyticsService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const user = AuthDetail.getLoginedInfo();
    if (user) {
      this.userTier = user.tier || 'BASIC';
      this.isPremium = (this.userTier === 'PRO' || this.userTier === 'PLUS' || user.role === 'ADMIN');
    }
  }

  setTab(tab: 'DASHBOARD' | 'TECHNICAL' | 'FUNDAMENTAL' | 'SHAREHOLDERS') {
    this.activeTab = tab;
  }

  performAnalysis() {
    if (!this.tickerInput.trim()) {
      this.toastr.warning("Vui lòng nhập mã Chứng khoán hoặc Crypto (ví dụ: FPT, BTCUSDT)");
      return;
    }

    // Luôn cho phép test ở bản UI cao cấp này
    this.isAnalyzing = true;
    this.analysisResult = null;

    this.analyticsService.analyzeTicker(this.tickerInput.toUpperCase()).subscribe({
      next: (res) => {
        this.analysisResult = res;
        this.updateWhaleChart(res);
        this.isAnalyzing = false;
        this.toastr.success("Phân tích hoàn tất!");
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Không thể phân tích mã này. Vui lòng thử lại sau.");
        this.isAnalyzing = false;
      }
    });
  }

  private updateWhaleChart(res: StockAnalysisResult) {
    if (res.whaleFlow) {
      // Mock update to chart based on simulated whale data
      this.whaleChartData.datasets[0].data[5] = -200; // Example
      this.whaleChartData.datasets[1].data[5] = 450;  // Example
      this.whaleChartData = { ...this.whaleChartData }; // Trigger CD
    }
  }

  getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'BULLISH': return '#10b981';
      case 'BEARISH': return '#ef4444';
      default: return '#f59e0b';
    }
  }

  getRiskColor(risk: string): string {
    switch (risk) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      default: return '#94a3b8';
    }
  }
}
