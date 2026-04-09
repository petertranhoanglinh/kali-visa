import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssetService } from 'src/app/service/asset.service';
import { AssetModel, AssetType } from 'src/app/model/asset.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';
import { MarketPriceService } from 'src/app/service/market-price.service';
import { MarketPriceModel } from 'src/app/model/market-price.model';
import { SystemConfigService } from 'src/app/service/system-config.service';
import { CommonUtils } from 'src/app/common/util/common-utils';

export interface GroupedAsset {
  symbol: string;
  type: AssetType;
  totalQuantity: number;
  averagePrice: number; // Cost Basis
  marketPrice?: number; // Current Market Price (Manual or Real-time)
  totalValue: number;
  totalCost: number;
  history: AssetModel[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
})
export class AssetListComponent implements OnInit {
  assets: AssetModel[] = [];
  groupedAssets: GroupedAsset[] = [];
  marketPrices: Map<string, number> = new Map();
  userTier: string = 'BASIC';
  isPremium: boolean = false;
  assetTypes = Object.values(AssetType);
  Math = Math; // Expose Math for template pagination
  
  // Ticker Selector State
  fullListing: any[] = [];
  cryptoListing: string[] = []; // New live list from Binance
  fundListing: any[] = []; // New live list from Fmarket
  filteredListing: any[] = [];
  searchTerm: string = '';
  currentPage: number = 0; // Backend is 0-indexed
  pageSize: number = 8;
  totalElements: number = 0;
  showTickerSelector = false;
  activeSelectorTab: 'STOCK' | 'CRYPTO' | 'GOLD' | 'FUND' = 'STOCK';
  selectedTicker: any = null;
  private refreshTimer: any;
  
  private EXCHANGE_RATE = 25000; // Default fallback
  
  // New Asset Form
  newAsset: AssetModel = {
    userId: '',
    type: AssetType.CRYPTO,
    symbol: '',
    quantity: 0,
    averagePrice: 0,
    currency: 'USD'
  };

  displayPrice: string = '';
  showAddForm = false;

  // Sell Asset Form
  newSellAsset: AssetModel = {
    userId: '',
    type: AssetType.CRYPTO,
    symbol: '',
    quantity: 0,
    averagePrice: 0,
    currency: 'USD',
    isSell: true
  };
  displaySellPrice: string = '';
  showSellForm = false;
  selectedGroup: GroupedAsset | null = null;

  constructor(
    private assetService: AssetService,
    private marketPriceService: MarketPriceService,
    private toastr: ToastrService,
    private configService: SystemConfigService
  ) { }

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    this.userTier = loginInfo?.tier || 'BASIC';
    this.isPremium = CommonUtils.checkPremiumStatus(loginInfo);
    this.loadExchangeRate();
    this.loadAssets();
    this.loadFullListing();

    // Tự động cập nhật giá realtime cho tài khoản PRO (mỗi 60 giây)
    if (this.isPremium) {
      this.refreshTimer = setInterval(() => {
        this.refreshProPrices();
      }, 60000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadFullListing() {
    this.filterListing();

    this.assetService.getCryptoListing().subscribe({
        next: (res) => {
            this.cryptoListing = res;
            if (this.activeSelectorTab === 'CRYPTO') this.filterListing();
        }
    });
  }

  onSearchChange() {
    this.currentPage = 0;
    this.filterListing();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.filterListing();
  }

  filterListing() {
    if (this.activeSelectorTab === 'STOCK' || this.activeSelectorTab === 'FUND') {
      this.assetService.getAssetListing(this.activeSelectorTab, this.searchTerm, this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          this.filteredListing = res.items;
          this.totalElements = res.totalElements;
        }
      });
    } else if (this.activeSelectorTab === 'CRYPTO') {
      const list = this.cryptoListing
        .filter(sym => sym.toLowerCase().includes(this.searchTerm.toLowerCase()))
        .map(sym => ({ symbol: sym, name: sym }));
      this.filteredListing = list.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
      this.totalElements = list.length;
    } else if (this.activeSelectorTab === 'GOLD') {
      this.assetService.getRealtimePrices(['SJC'], ['GOLD']).subscribe(prices => {
        const sjcPrice = prices['SJC'] || 82000000;
        this.filteredListing = [
            {symbol: 'SJC', name: `Vàng Miếng SJC (${this.formatNumber(sjcPrice)} ₫)`, type: 'AUTO'},
            {symbol: 'Vàng 9999', name: 'Vàng Truyền Thống / Nhẫn (Nhập tay)', type: 'MANUAL'}
        ];
        this.totalElements = this.filteredListing.length;
      });
    }
  }

  get paginatedListing() {
    return this.filteredListing; // Already paginated from server or slice
  }

  setSelectorTab(tab: 'STOCK' | 'CRYPTO' | 'GOLD' | 'FUND') {
    this.activeSelectorTab = tab;
    this.searchTerm = '';
    this.currentPage = 0;
    this.filterListing();
  }

  selectTicker(item: any) {
    this.newAsset.symbol = item.symbol;
    this.newAsset.type = this.activeSelectorTab as AssetType;
    
    // Custom logic for Gold types
    if (this.activeSelectorTab === 'GOLD') {
      if (item.symbol === 'SJC') {
        this.newAsset.currency = 'VND';
      } else {
        this.newAsset.currency = 'VND';
      }
    } else if (this.activeSelectorTab === 'STOCK') {
      this.newAsset.currency = 'VND';
    } else if (this.activeSelectorTab === 'FUND') {
        this.newAsset.currency = 'VND';
    } else {
      this.newAsset.currency = 'USD';
    }

    this.showTickerSelector = false;
  }

  loadExchangeRate() {
    this.configService.getConfig('USD_VND_RATE').subscribe({
      next: (res) => {
        if (res && res.configValue) {
          this.EXCHANGE_RATE = Number(res.configValue);
        }
      },
      error: () => console.warn('Could not load exchange rate, using default 25,000')
    });
  }

  loadAssets() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (userId) {
      this.assetService.getAssetsByUser(userId).subscribe({
        next: (res) => {
          this.assets = res;
          
          // LUÔN LUÔN load giá thủ công từ DB trước (Dành cho Vàng, Quỹ, Trái phiếu...)
          this.marketPriceService.getPricesByUser(userId).subscribe({
            next: (prices) => {
              prices.forEach(p => this.marketPrices.set(p.symbol, p.price));
              
              if (this.isPremium) {
                // Nếu là PRO: Fetch thêm giá realtime cho STOCK/CRYPTO để đè lên
                this.refreshProPrices();
              } else {
                this.groupAssets();
              }
            },
            error: () => {
              if (this.isPremium) {
                this.refreshProPrices();
              } else {
                this.groupAssets();
              }
            }
          });
        },
        error: (err) => {
          this.toastr.error("Failed to load assets");
          console.error(err);
        }
      });
    }
  }

  groupAssets() {
    const groups = new Map<string, GroupedAsset>();
    
    this.assets.forEach(asset => {
      const key = `${asset.symbol}-${asset.type}`;
      if (!groups.has(key)) {
        groups.set(key, {
          symbol: asset.symbol,
          type: asset.type,
          totalQuantity: 0,
          averagePrice: 0,
          totalValue: 0,
          totalCost: 0,
          history: [],
          isExpanded: false
        });
      }
      
      const group = groups.get(key)!;
      group.history.push(asset);
    });

    this.groupedAssets = Array.from(groups.values()).map(group => {
      let totalPurchaseQty = 0;
      let totalPurchaseCost = 0;
      let netQty = 0;

      // Calculate Weighted Average Cost from all BUYS
      group.history.forEach(h => {
        if (!h.isSell) {
          totalPurchaseQty += (h.quantity || 0);
          totalPurchaseCost += ((h.quantity || 0) * (h.averagePrice || 0));
          netQty += (h.quantity || 0);
        } else {
          netQty -= (h.quantity || 0);
        }
      });

      group.totalQuantity = netQty;
      group.averagePrice = totalPurchaseQty > 0 ? (totalPurchaseCost / totalPurchaseQty) : 0;
      
      // Cost Basis of REMAINING quantity
      group.totalCost = Math.max(0, netQty * group.averagePrice);

      // Current Market Value
      const currentPrice = this.marketPrices.get(group.symbol) || group.averagePrice;
      group.marketPrice = currentPrice;
      group.totalValue = netQty * currentPrice;

      // Sort history Descending
      group.history.sort((a, b) => {
        const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
        const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
        return dateB - dateA;
      });

      return group;
    });
  }

  refreshProPrices() {
    if (!this.isPremium) {
      this.groupAssets();
      return;
    }

    const uniqueSymbols = Array.from(new Set(this.assets.map(a => a.symbol)));
    // Only refresh automated types (STOCK, SJC, CRYPTO, FUND)
    // Only refresh automated types (STOCK and CRYPTO)
    const symbolsToRefresh = uniqueSymbols.filter(s => {
      const asset = this.assets.find(a => a.symbol === s);
      if (!asset) return false;
      return asset.type === AssetType.STOCK || asset.type === AssetType.CRYPTO;
    });

    const types = symbolsToRefresh.map(sym => this.assets.find(a => a.symbol === sym)?.type || 'STOCK');

    if (symbolsToRefresh.length === 0) {
      this.groupAssets();
      return;
    }

    this.assetService.getRealtimePrices(symbolsToRefresh, types).subscribe({
      next: (priceMap) => {
        Object.keys(priceMap).forEach(sym => {
          if (priceMap[sym] > 0) this.marketPrices.set(sym, priceMap[sym]);
        });
        this.groupAssets();
      },
      error: () => this.groupAssets()
    });
  }

  toggleDetail(group: GroupedAsset) {
    group.isExpanded = !group.isExpanded;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newAsset.purchaseDate = this.formatDateForInput(new Date());
    }
  }

  addAsset() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) {
      this.toastr.error("Please log in again!");
      return;
    }

    this.newAsset.userId = userId;
    this.newAsset.averagePrice = this.parseNumber(this.displayPrice);

    if (!this.newAsset.purchaseDate) {
      this.newAsset.purchaseDate = new Date().toISOString();
    }

    // Validation for Stocks
    if (this.newAsset.type === 'STOCK') {
      this.assetService.validateSymbol(this.newAsset.symbol).subscribe({
        next: (v) => {
          if (v.isValid) {
            this.executeAddAsset();
          } else {
            this.toastr.error(`Mã chứng khoán '${this.newAsset.symbol}' không hợp lệ trên thị trường Việt Nam.`);
          }
        },
        error: () => this.executeAddAsset() // Fallback to add if validation service fails
      });
    } else {
      this.executeAddAsset();
    }
  }

  private executeAddAsset() {
    this.assetService.addAsset(this.newAsset).subscribe({
      next: (res) => {
        this.toastr.success("Asset added successfully");
        this.loadAssets();
        this.showAddForm = false;
        this.resetForm();
      },
      error: (err) => {
        this.toastr.error("Failed to add asset");
      }
    });
  }

  // --- Sell Logic ---

  toggleSellForm(group?: GroupedAsset) {
    this.showSellForm = !this.showSellForm;
    if (this.showSellForm && group) {
      this.selectedGroup = group;
      this.newSellAsset = {
        userId: group.history[0].userId,
        type: group.type,
        symbol: group.symbol,
        quantity: group.totalQuantity, // Default to selling all
        averagePrice: group.marketPrice || 0,
        currency: group.history[0].currency,
        isSell: true,
        purchaseDate: this.formatDateForInput(new Date())
      };
      this.displaySellPrice = this.formatNumber(this.newSellAsset.averagePrice);
    }
  }

  submitSell() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) return;

    // Validate sufficient quantity
    if (this.selectedGroup && this.newSellAsset.quantity > this.selectedGroup.totalQuantity) {
      this.toastr.error(`Không đủ số lượng để bán. Bạn chỉ còn ${this.selectedGroup.totalQuantity} ${this.newSellAsset.symbol}.`);
      return;
    }

    this.newSellAsset.averagePrice = this.parseNumber(this.displaySellPrice);
    // Use the date from the input, or default to now if missing
    if (!this.newSellAsset.purchaseDate) {
      this.newSellAsset.purchaseDate = new Date().toISOString();
    }

    // 1. Record the SELL transaction
    this.assetService.addAsset(this.newSellAsset).subscribe({
      next: () => {
        // 2. Automatically Add to CASH
        const proceeds = this.newSellAsset.quantity * this.newSellAsset.averagePrice;
        const cashAsset: AssetModel = {
          userId: userId,
          type: AssetType.CASH,
          symbol: this.newSellAsset.currency === 'VND' ? 'Tiền mặt (VND)' : 'Tiền mặt (USD)',
          quantity: proceeds,
          averagePrice: 1, // Cash is always 1:1
          currency: this.newSellAsset.currency,
          isSell: false,
          purchaseDate: new Date().toISOString()
        };

        this.assetService.addAsset(cashAsset).subscribe({
          next: () => {
            this.toastr.success(`Sold ${this.newSellAsset.symbol} and added proceeds to Cash`);
            this.loadAssets();
            this.showSellForm = false;
          }
        });
      },
      error: () => this.toastr.error("Failed to process sale")
    });
  }

  onSellPriceChange(event: any) {
    const val = event.target.value;
    const num = this.parseNumber(val);
    if (!isNaN(num)) this.displaySellPrice = this.formatNumber(num);
  }

  // --- Formatting Helpers ---

  onPriceChange(event: any) {
    const value = event.target.value;
    const numericValue = this.parseNumber(value);
    if (!isNaN(numericValue)) {
      this.displayPrice = this.formatNumber(numericValue);
    }
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  parseNumber(str: string): number {
    if (!str) return 0;
    return parseFloat(str.replace(/,/g, ''));
  }

  getCurrencyPipe(currency?: string): string {
    return currency === 'VND' ? '1.0-0' : '1.2-2';
  }

  getCurrencySymbol(currency?: string): string {
    return currency === 'VND' ? '₫' : '$';
  }

  deleteAsset(id: string | undefined) {
    if (!id) return;
    if (confirm("Are you sure you want to delete this record?")) {
      this.assetService.deleteAsset(id).subscribe({
        next: () => {
          this.toastr.success("Record deleted");
          this.loadAssets();
        }
      });
    }
  }

  deleteAssetGroup(group: GroupedAsset) {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) return;

    if (confirm(`⚠️ CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN toàn bộ lịch sử giao dịch của mã ${group.symbol} (${group.type}). Bạn có chắc chắn muốn tiếp tục?`)) {
      this.assetService.deleteAssetGroup(userId, group.symbol, group.type).subscribe({
        next: () => {
          this.toastr.success(`Đã xóa sạch dữ liệu của ${group.symbol}`);
          this.loadAssets();
        },
        error: () => this.toastr.error("Lỗi khi xóa nhóm tài sản")
      });
    }
  }

  private resetForm() {
    this.newAsset = {
      userId: '',
      type: AssetType.CRYPTO,
      symbol: '',
      quantity: 0,
      averagePrice: 0,
      currency: 'USD',
      purchaseDate: this.formatDateForInput(new Date())
    };
    this.displayPrice = '';
  }

  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return date.getFullYear() + '-' +
      pad(date.getMonth() + 1) + '-' +
      pad(date.getDate()) + 'T' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes());
  }

  calculateTotal(asset: AssetModel): number {
    return (asset.quantity || 0) * (asset.averagePrice || 0);
  }

  calculatePL(group: GroupedAsset): number {
    return group.totalValue - group.totalCost;
  }

  getTotalValueVND(): number {
    return this.groupedAssets.reduce((acc, g) => {
      let valVND = g.totalValue;
      if (g.history.length > 0 && g.history[0].currency === 'USD') {
        valVND *= this.EXCHANGE_RATE;
      }
      return acc + valVND;
    }, 0);
  }

  getTotalCostVND(): number {
    return this.groupedAssets.reduce((acc, g) => {
      if (g.type === AssetType.CASH) return acc;
      
      let costVND = g.totalCost;
      if (g.history.length > 0 && g.history[0].currency === 'USD') {
        costVND *= this.EXCHANGE_RATE;
      }
      return acc + costVND;
    }, 0);
  }

  getTotalValue(): number {
    return this.groupedAssets.reduce((acc, g) => acc + g.totalValue, 0);
  }

  getTotalCost(): number {
    return this.groupedAssets.reduce((acc, g) => {
      if (g.type === AssetType.CASH) return acc;
      return acc + g.totalCost;
    }, 0);
  }
}
