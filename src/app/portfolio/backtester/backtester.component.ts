import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-backtester',
  templateUrl: './backtester.component.html',
  styleUrls: ['./backtester.component.css']
})
export class BacktesterComponent implements OnInit {
  // UI State
  isPremium: boolean = false;
  symbol: string = 'FPT'; // default
  isLoadingData: boolean = false;
  isRunningBacktest: boolean = false;
  errorMessage: string = '';

  // Data
  rawHistoricalData: any[] = [];
  backtestResult: any = null;
  expandedTradeIndex: number = -1;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 20;

  // Form Model
  backtestStartDate: string = '';
  backtestEndDate: string = '';
  backtestCapital: number = 100000000;
  dcaMonthlyAmount: number = 10000000;
  backtestStrategy: string = 'RSI_SMA';

  // Chart configuration
  public equityChartType: ChartType = 'line';
  public equityChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Giá Trị Tài Sản (VND)', 
        borderColor: '#a855f7', 
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        fill: true,
        tension: 0.2,
        pointRadius: 0
      }
    ]
  };
  public equityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } }
    }
  };

  constructor(private http: HttpClient) {
    // Default Dates
    const today = new Date();
    this.backtestEndDate = today.toISOString().split('T')[0];
    const pastYear = new Date(today);
    pastYear.setFullYear(today.getFullYear() - 1);
    this.backtestStartDate = pastYear.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.isPremium = CommonUtils.checkPremiumStatus(AuthDetail.getLoginedInfo());
    this.symbol = ''; // Xóa mã mặc định để người dùng tự nhập
  }

  fetchDataAndRun() {
    if (!this.symbol) return;
    this.isLoadingData = true;
    this.errorMessage = '';
    this.backtestResult = null;
    this.currentPage = 1;
    
    // Call Python directly for fast history
    this.http.get<any>( `${CommonUtils.PYTHON_URL}/api/v3/backtest/data/${this.symbol.toUpperCase()}`).subscribe({
      next: (res) => {
        if (res.error || !res.data || res.data.length === 0) {
          this.errorMessage = res.error || "Không tìm thấy dữ liệu cho mã CP này.";
          this.isLoadingData = false;
          return;
        }
        this.rawHistoricalData = res.data;
        this.isLoadingData = false;
        
        // Auto run after fetching
        this.runSimulatedBacktest();
      },
      error: (err) => {
        this.isLoadingData = false;
        this.errorMessage = 'Không thể kết nối máy chủ phân tích tự động.';
      }
    });
  }

  runSimulatedBacktest() {
    if (this.rawHistoricalData.length === 0) {
      alert("Vui lòng tải dữ liệu mã chứng khoán trước!");
      return;
    }

    this.isRunningBacktest = true;
    this.backtestResult = null;
    this.currentPage = 1;

    setTimeout(() => {
      let cash = this.backtestCapital; 
      let totalCapitalInjected = this.backtestCapital;
      let shares = 0;
      let trades: any[] = [];
      let buyPrice = 0;
      let isHolding = false;

      let tech = [...this.rawHistoricalData];
      let equityTimeline: number[] = [];
      let dateTimeline: string[] = [];
      
      // Filter by Date
      if (this.backtestStartDate) {
          const startTk = new Date(this.backtestStartDate).getTime();
          tech = tech.filter(t => { const d = new Date(t.time); return isNaN(d.getTime()) ? true : d.getTime() >= startTk; });
      }
      if (this.backtestEndDate) {
          const endTk = new Date(this.backtestEndDate).getTime() + 86400000; 
          tech = tech.filter(t => { const d = new Date(t.time); return isNaN(d.getTime()) ? true : d.getTime() <= endTk; });
      }

      if (tech.length < 3) {
          this.isRunningBacktest = false;
          alert("Khoảng thời gian này không đủ dữ liệu quá khứ. Hãy chọn mốc bắt đầu xa hơn.");
          return;
      }

      for (let i = 2; i < tech.length; i++) {
        const today = tech[i];
        const yesterday = tech[i-1];
        const beforeObj = tech[i-2];
        const price = today.open || today.close;
        const yesterdayPrice = yesterday.close;
        
        let buySignal = false;
        let sellSignal = false;
        let buyReason = '';
        let sellReason = '';

        const currentMonth = new Date(today.time).getMonth();
        const prevMonth = new Date(yesterday.time).getMonth();

        if (this.backtestStrategy === 'RSI_SMA') {
            const isRsiLow = yesterday.rsi < 35;
            const isGoldenCross = yesterday.sma20 > yesterday.sma50 && beforeObj.sma20 <= beforeObj.sma50;
            const isRsiHigh = yesterday.rsi > 70;
            const isDeathCross = yesterday.sma20 < yesterday.sma50 && beforeObj.sma20 >= beforeObj.sma50;

            if (isRsiLow || isGoldenCross) { buySignal = true; buyReason = isGoldenCross ? 'Golden Cross' : 'RSI Oversold'; }
            if (isRsiHigh || isDeathCross) { sellSignal = true; sellReason = isDeathCross ? 'Death Cross' : 'RSI Overbought'; }
        }
        else if (this.backtestStrategy === 'MACD') {
            const macdCrossUp = yesterday.macd > yesterday.macd_signal && beforeObj.macd <= beforeObj.macd_signal;
            const macdCrossDown = yesterday.macd < yesterday.macd_signal && beforeObj.macd >= beforeObj.macd_signal;
            
            if (macdCrossUp) { buySignal = true; buyReason = 'MACD Crossover Up'; }
            if (macdCrossDown) { sellSignal = true; sellReason = 'MACD Crossover Down'; }
        }
        else if (this.backtestStrategy === 'MEAN_REVERSION') {
            const priceDropped = yesterdayPrice < (yesterday.sma20 * 0.95); // 5% below SMA20
            const priceRecovered = yesterdayPrice > yesterday.sma20 && beforeObj.close <= beforeObj.sma20;
            
            if (priceDropped) { buySignal = true; buyReason = 'Price Drop > 5% below SMA20'; }
            if (priceRecovered) { sellSignal = true; sellReason = 'Reverted to SMA20 Average'; }
        }
        else if (this.backtestStrategy === 'DCA') {
            if (i === 2) { 
                buySignal = true; buyReason = 'DCA Vốn khởi điểm'; 
            }
            else if (currentMonth !== prevMonth) { 
                buySignal = true; buyReason = 'DCA Phân bổ định kỳ'; 
            }
        }
        else if (this.backtestStrategy === 'TREND_FOLLOWING_PRO') {
            const isUptrend = yesterday.close > yesterday.sma200;
            const macdCrossUp = yesterday.macd > yesterday.macd_signal && beforeObj.macd <= beforeObj.macd_signal;
            const brokeSma50 = yesterdayPrice < yesterday.sma50;

            if (isUptrend && macdCrossUp) { buySignal = true; buyReason = 'Trend Following (Giá > SMA200 & Bơm MACD)'; }
            if (brokeSma50) { sellSignal = true; sellReason = 'Bảo toàn Mất Trend (Gãy SMA50)'; }
        }
        else if (this.backtestStrategy === 'SNIPER_SCALPING') {
            const smaCrossUp = yesterday.close > yesterday.sma20 && beforeObj.close <= beforeObj.sma20;
            
            if (smaCrossUp && yesterday.rsi < 45) { buySignal = true; buyReason = 'Sniper (RSI thấp & Vượt SMA20)'; }
            
            if (isHolding && buyPrice > 0) {
                const currentProfit = ((price - buyPrice) / buyPrice) * 100;
                if (currentProfit >= 7) { sellSignal = true; sellReason = 'Chốt Lãi Ngắn Hạn (Lợi nhuận >= 7%)'; }
                else if (currentProfit <= -4) { sellSignal = true; sellReason = 'Cắt Lỗ Kỷ Luật (Vi phạm -4%)'; }
            }
        }

        // Bơm tiền hàng tháng áp dụng cho MỌI CHIẾN LƯỢC nếu có nhập dcaMonthlyAmount > 0
        if (i > 2 && currentMonth !== prevMonth && this.dcaMonthlyAmount > 0) {
            cash += this.dcaMonthlyAmount;
            totalCapitalInjected += this.dcaMonthlyAmount;
        }

        let snap = {
            rsi: yesterday.rsi,
            sma20: yesterday.sma20,
            sma50: yesterday.sma50,
            macd: yesterday.macd,
            macd_signal: yesterday.macd_signal,
            close: yesterdayPrice
        };

        if (buySignal) {
          if (this.backtestStrategy === 'DCA') {
             // DCA luôn ưu tiên mua hết tiền mặt nạp vào
             let sharesToBuy = Math.floor(cash / price);
             if (sharesToBuy > 0) {
                 cash -= sharesToBuy * price;
                 let value = sharesToBuy * price;
                 if (shares === 0) { buyPrice = price; } 
                 else { buyPrice = ((shares * buyPrice) + value) / (shares + sharesToBuy); }
                 shares += sharesToBuy;
                 isHolding = true;
                 trades.push({ type: 'MUA', date: today.time, price: price, reason: buyReason, value: value, indicatorsSnap: snap });
             }
          } else {
             // Basic Signal Bot
             if (!isHolding) {
                shares = Math.floor(cash / price);
                cash -= shares * price;
                buyPrice = price;
                isHolding = true;
                trades.push({ type: 'MUA', date: today.time, price: price, reason: buyReason, value: shares * price, indicatorsSnap: snap });
             }
          }
        }
        else if (isHolding && sellSignal) {
          let value = shares * price;
          let profit = ((price - buyPrice) / buyPrice) * 100;
          cash += value;
          shares = 0;
          isHolding = false;
          trades.push({ type: 'BÁN', date: today.time, price: price, reason: sellReason, value: value, profit: profit, indicatorsSnap: snap });
        }
        
        let dailyEquity = cash + (shares * tech[i].close);
        equityTimeline.push(dailyEquity);
        dateTimeline.push(today.time);
      }

      // Close position at end of period safely
      if (isHolding) {
        let finalPrice = tech[tech.length - 1].close;
        let value = shares * finalPrice;
        let profit = ((finalPrice - buyPrice) / buyPrice) * 100;
        cash += value;
        trades.push({ type: 'BÁN', date: tech[tech.length - 1].time, price: finalPrice, reason: 'Chốt tất toán danh mục cuối kỳ', value: value, profit: profit });
      }

      let totalReturn = ((cash - totalCapitalInjected) / totalCapitalInjected) * 100;
      let buyHoldReturn = ((tech[tech.length - 1].close - tech[0].close) / tech[0].close) * 100;
      let sellTrades = trades.filter(t => t.type === 'BÁN');
      let winTrades = sellTrades.filter(t => t.profit && t.profit > 0).length;
      
      this.backtestResult = {
        initialCapital: totalCapitalInjected, // Báo cáo Vốn Tổng sau nhiều kỳ DCA
        finalCapital: cash,
        totalReturn: totalReturn,
        buyHoldReturn: buyHoldReturn,
        winRate: sellTrades.length > 0 ? (winTrades / sellTrades.length) * 100 : 0,
        trades: trades.reverse(),
        period: tech.length
      };

      // Update Chart
      this.equityChartData = {
        labels: dateTimeline,
        datasets: [{
          ...this.equityChartData.datasets[0],
          data: equityTimeline
        }]
      };

      this.isRunningBacktest = false;
    }, 800);
  }

  toggleTradeDetail(index: number) {
    if (this.expandedTradeIndex === index) {
      this.expandedTradeIndex = -1;
    } else {
      this.expandedTradeIndex = index;
    }
  }

  get paginatedTrades() {
    if (!this.backtestResult || !this.backtestResult.trades) return [];
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.backtestResult.trades.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    if (!this.backtestResult || !this.backtestResult.trades) return 0;
    return Math.ceil(this.backtestResult.trades.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.expandedTradeIndex = -1;
    }
  }
}
