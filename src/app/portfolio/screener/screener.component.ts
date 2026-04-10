import { Component, OnInit } from '@angular/core';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';
import { MarketSignalService } from 'src/app/service/market-signal.service';

declare var bootstrap: any;

@Component({
  selector: 'app-screener',
  templateUrl: './screener.component.html',
  styleUrls: ['./screener.component.css']
})
export class ScreenerComponent implements OnInit {
  isPremium: boolean = false;
  isLoading: boolean = false;
  lastUpdated: string = '';
  
  // Data
  rawSignalsFromJava: any[] = [];
  processedSignals: any[] = [];
  
  // View mode
  signalFilter: string = 'ALL'; // ALL, MUA, BAN, CHO
  selectedStrategy: string = 'TREND_FOLLOWING_PRO';

  // Pagination state
  page: number = 0;
  size: number = 20;
  totalElements: number = 0;
  totalPages: number = 0;

  // Manual Scan & AI
  customSymbol: string = '';
  isScanning: boolean = false;
  isAnalyzing: boolean = false;
  selectedSymbol: string = '';
  aiReport: any = null;

  constructor(private marketSignalService: MarketSignalService) {}

  ngOnInit(): void {
    this.isPremium = CommonUtils.checkPremiumStatus(AuthDetail.getLoginedInfo());
    if (this.isPremium) {
      this.fetchScreenerData();
    }
  }

  setSignalFilter(filter: string) {
    this.signalFilter = filter;
    this.page = 0; // Reset về trang 1
    this.fetchScreenerData();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.fetchScreenerData();
    }
  }

  fetchScreenerData() {
    this.isLoading = true;
    
    // Sử dụng getAllSignals với filter recommendation
    this.marketSignalService.getAllSignals(this.page, this.size, this.signalFilter).subscribe({
      next: (res) => {
        this.rawSignalsFromJava = res.items || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        
        this.filterSignals();
        this.isLoading = false;
        
        if (this.rawSignalsFromJava.length > 0) {
           this.lastUpdated = new Date(this.rawSignalsFromJava[0].lastScanTime).toLocaleTimeString('vi-VN');
        }
      },
      error: (err) => {
        console.error("Lỗi lấy dữ liệu từ Java", err);
        this.isLoading = false;
      }
    });
  }

  filterSignals() {
    let list = [...this.rawSignalsFromJava];
    
    // Note: Backend đã xử lý filter, ở đây ta chỉ map data

    this.processedSignals = list.map(item => ({
      symbol: item.symbol,
      price: item.price ? item.price * 1000 : 0,
      changePercent: item.changePercent,
      rsi: item.rsi,
      macd: item.macd,
      sma200: item.sma200,
      isBuy: item.recommendation === 'MUA',
      isSell: item.recommendation === 'BÁN',
      reason: item.reason,
      lastUpdated: item.lastScanTime
    }));

    // Sort: Mua trước, Bán sau, rồi đến các mã khác
    this.processedSignals.sort((a, b) => {
      if (a.isBuy && !b.isBuy) return -1;
      if (!a.isBuy && b.isBuy) return 1;
      if (a.isSell && !b.isSell) return -1;
      if (!a.isSell && b.isSell) return 1;
      return 0;
    });
  }

  get activeSignalsCount() {
    return this.rawSignalsFromJava.filter(s => s.recommendation !== 'CHO').length;
  }

  manualScan() {
    if (!this.customSymbol || this.isScanning) return;
    
    this.isScanning = true;
    this.marketSignalService.scanSymbol(this.customSymbol).subscribe({
      next: (res) => {
        this.isScanning = false;
        this.fetchScreenerData(); // Refresh list to see the manual scan result
        this.customSymbol = '';
      },
      error: (err) => {
        this.isScanning = false;
        alert("Không thể quét mã này. Vui lòng kiểm tra lại!");
      }
    });
  }

  openAnalysis(symbol: string) {
    this.selectedSymbol = symbol;
    this.aiReport = null;
    this.isAnalyzing = true;
    
    // Open Modal
    const modalEl = document.getElementById('aiAnalysisModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }

    this.marketSignalService.getAiAnalysis(symbol).subscribe({
      next: (res) => {
        this.aiReport = res;
        this.isAnalyzing = false;
      },
      error: (err) => {
        this.isAnalyzing = false;
        console.error("AI Analysis Error", err);
      }
    });
  }
}
