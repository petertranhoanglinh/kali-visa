import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, combineLatestWith } from 'rxjs/operators';

import { AssetService } from 'src/app/service/asset.service';
import { AssetModel, AssetType } from 'src/app/model/asset.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';
import { CommonUtils } from 'src/app/common/util/common-utils';

import {
  loadPortfolioData,
  loadRealtimePrices,
  invalidatePortfolioCache,
  refreshPortfolioData,
} from 'src/app/actions/portfolio.actions';
import {
  selectAssets,
  selectMergedPriceMap,
  selectExchangeRate,
  selectIsLoading,
  selectIsLoaded,
} from 'src/app/selectors/portfolio.selector';

export interface GroupedAsset {
  symbol: string;
  type: AssetType;
  totalQuantity: number;
  averagePrice: number;   // Giá vốn bình quân
  marketPrice?: number;   // Giá hiện tại (manual hoặc realtime)
  totalValue: number;     // Giá trị hiện tại
  totalCost: number;      // Vốn đầu tư (của lượng còn lại)
  profitLoss: number;     // Lãi/Lỗ tuyệt đối
  profitLossPercent: number; // Lãi/Lỗ %
  currency: string;
  history: AssetModel[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
})
export class AssetListComponent implements OnInit, OnDestroy {
  assets: AssetModel[] = [];
  groupedAssets: GroupedAsset[] = [];
  userTier: string = 'BASIC';
  isPremium: boolean = false;
  assetTypes = Object.values(AssetType);
  Math = Math;

  // Ticker Selector State
  fullListing: any[] = [];
  cryptoListing: string[] = [];
  fundListing: any[] = [];
  filteredListing: any[] = [];
  searchTerm: string = '';
  currentPage: number = 0;
  pageSize: number = 8;
  totalElements: number = 0;
  showTickerSelector = false;
  activeSelectorTab: 'STOCK' | 'CRYPTO' | 'GOLD' | 'FUND' = 'STOCK';
  selectedTicker: any = null;
  private refreshTimer: any;

  private EXCHANGE_RATE = 25000;
  private currentPriceMap = new Map<string, number>();

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

  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private assetService: AssetService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    this.userTier = loginInfo?.tier || 'BASIC';
    this.isPremium = CommonUtils.checkPremiumStatus(loginInfo);

    // Dispatch load — Effect tự kiểm tra cache
    this.store.dispatch(loadPortfolioData());

    // Loading state
    this.store.select(selectIsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    // Khi loaded xong → trigger realtime nếu PRO + setup auto-refresh
    this.store.select(selectIsLoaded)
      .pipe(
        takeUntil(this.destroy$),
        filter(loaded => loaded),
        combineLatestWith(this.store.select(selectAssets))
      )
      .subscribe(([, assets]) => {
        if (this.isPremium && assets.length > 0) {
          this._dispatchRealtimePrices(assets);

          // Auto-refresh realtime mỗi 60 giây cho PRO
          if (!this.refreshTimer) {
            this.refreshTimer = setInterval(() => {
              if (assets.length > 0) this._dispatchRealtimePrices(assets);
            }, 60000);
          }
        }
      });

    // Reactive: khi assets hoặc price map thay đổi → re-group
    this.store.select(selectAssets)
      .pipe(
        takeUntil(this.destroy$),
        combineLatestWith(
          this.store.select(selectMergedPriceMap),
          this.store.select(selectExchangeRate)
        )
      )
      .subscribe(([assets, priceMap, rate]) => {
        this.assets = assets;
        this.currentPriceMap = priceMap;
        this.EXCHANGE_RATE = rate;
        if (assets.length >= 0) {
          this.groupAssets(priceMap);
        }
      });

    this.loadFullListing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  private _dispatchRealtimePrices(assets: AssetModel[]) {
    const uniqueSymbols = Array.from(new Set(assets.map(a => a.symbol)));
    const symbolsToRefresh = uniqueSymbols.filter(s => {
      const asset = assets.find(a => a.symbol === s);
      return asset && (asset.type === AssetType.STOCK || asset.type === AssetType.CRYPTO);
    });

    if (symbolsToRefresh.length > 0) {
      const types = symbolsToRefresh.map(
        sym => assets.find(a => a.symbol === sym)?.type || 'STOCK'
      );
      this.store.dispatch(loadRealtimePrices({ symbols: symbolsToRefresh, types }));
    }
  }

  // ─── Ticker Listing ──────────────────────────────────────────────

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
          { symbol: 'SJC', name: `Vàng Miếng SJC (${this.formatNumber(sjcPrice)} ₫)`, type: 'AUTO' },
          { symbol: 'Vàng 9999', name: 'Vàng Truyền Thống / Nhẫn (Nhập tay)', type: 'MANUAL' }
        ];
        this.totalElements = this.filteredListing.length;
      });
    }
  }

  get paginatedListing() {
    return this.filteredListing;
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

    if (this.activeSelectorTab === 'GOLD' || this.activeSelectorTab === 'STOCK' || this.activeSelectorTab === 'FUND') {
      this.newAsset.currency = 'VND';
    } else {
      this.newAsset.currency = 'USD';
    }

    this.showTickerSelector = false;
  }

  // ─── Group & Calculate ───────────────────────────────────────────

  groupAssets(priceMap: Map<string, number> = this.currentPriceMap) {
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
          profitLoss: 0,
          profitLossPercent: 0,
          currency: asset.currency || 'USD',
          history: [],
          isExpanded: groups.get(key)?.isExpanded ?? false,
        });
      }

      const group = groups.get(key)!;
      group.history.push(asset);
    });

    this.groupedAssets = Array.from(groups.values()).map(group => {
      let totalPurchaseQty = 0;
      let totalPurchaseCost = 0;
      let netQty = 0;

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
      group.totalCost = Math.max(0, netQty * group.averagePrice);

      const currentPrice = priceMap.get(group.symbol) || group.averagePrice;
      group.marketPrice = currentPrice;
      group.totalValue = netQty * currentPrice;

      // Lãi/Lỗ
      group.profitLoss = group.totalValue - group.totalCost;
      group.profitLossPercent = group.totalCost > 0 ? (group.profitLoss / group.totalCost) : 0;

      group.history.sort((a, b) => {
        const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
        const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
        return dateB - dateA;
      });

      return group;
    });
  }

  // ─── Add / Delete / Sell ─────────────────────────────────────────

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newAsset.purchaseDate = this.formatDateForInput(new Date());
    }
  }

  addAsset() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) { this.toastr.error('Please log in again!'); return; }

    this.newAsset.userId = userId;
    this.newAsset.averagePrice = this.parseNumber(this.displayPrice);

    if (!this.newAsset.purchaseDate) {
      this.newAsset.purchaseDate = new Date().toISOString();
    }

    if (this.newAsset.type === 'STOCK') {
      this.assetService.validateSymbol(this.newAsset.symbol).subscribe({
        next: (v) => {
          if (v.isValid) this.executeAddAsset();
          else this.toastr.error(`Mã '${this.newAsset.symbol}' không hợp lệ.`);
        },
        error: () => this.executeAddAsset()
      });
    } else {
      this.executeAddAsset();
    }
  }

  private executeAddAsset() {
    this.assetService.addAsset(this.newAsset).subscribe({
      next: () => {
        this.toastr.success('Asset added successfully');
        this.showAddForm = false;
        this.resetForm();
        // Invalidate cache rồi force refresh
        this.store.dispatch(invalidatePortfolioCache());
        this.store.dispatch(refreshPortfolioData());
      },
      error: () => this.toastr.error('Failed to add asset')
    });
  }

  toggleSellForm(group?: GroupedAsset) {
    this.showSellForm = !this.showSellForm;
    if (this.showSellForm && group) {
      this.selectedGroup = group;
      this.newSellAsset = {
        userId: group.history[0].userId,
        type: group.type,
        symbol: group.symbol,
        quantity: group.totalQuantity,
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

    if (this.selectedGroup && this.newSellAsset.quantity > this.selectedGroup.totalQuantity) {
      this.toastr.error(`Không đủ số lượng. Còn ${this.selectedGroup.totalQuantity} ${this.newSellAsset.symbol}.`);
      return;
    }

    this.newSellAsset.averagePrice = this.parseNumber(this.displaySellPrice);
    if (!this.newSellAsset.purchaseDate) {
      this.newSellAsset.purchaseDate = new Date().toISOString();
    }

    this.assetService.addAsset(this.newSellAsset).subscribe({
      next: () => {
        const proceeds = this.newSellAsset.quantity * this.newSellAsset.averagePrice;
        const cashAsset: AssetModel = {
          userId,
          type: AssetType.CASH,
          symbol: this.newSellAsset.currency === 'VND' ? 'Tiền mặt (VND)' : 'Tiền mặt (USD)',
          quantity: proceeds,
          averagePrice: 1,
          currency: this.newSellAsset.currency,
          isSell: false,
          purchaseDate: new Date().toISOString()
        };

        this.assetService.addAsset(cashAsset).subscribe({
          next: () => {
            this.toastr.success(`Đã bán ${this.newSellAsset.symbol} và cộng tiền mặt`);
            this.showSellForm = false;
            this.store.dispatch(invalidatePortfolioCache());
            this.store.dispatch(refreshPortfolioData());
          }
        });
      },
      error: () => this.toastr.error('Failed to process sale')
    });
  }

  deleteAsset(id: string | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this record?')) {
      this.assetService.deleteAsset(id).subscribe({
        next: () => {
          this.toastr.success('Record deleted');
          this.store.dispatch(invalidatePortfolioCache());
          this.store.dispatch(refreshPortfolioData());
        }
      });
    }
  }

  deleteAssetGroup(group: GroupedAsset) {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) return;

    if (confirm(`⚠️ CẢNH BÁO: Xóa toàn bộ lịch sử của ${group.symbol} (${group.type})?`)) {
      this.assetService.deleteAssetGroup(userId, group.symbol, group.type).subscribe({
        next: () => {
          this.toastr.success(`Đã xóa ${group.symbol}`);
          this.store.dispatch(invalidatePortfolioCache());
          this.store.dispatch(refreshPortfolioData());
        },
        error: () => this.toastr.error('Lỗi khi xóa nhóm tài sản')
      });
    }
  }

  toggleDetail(group: GroupedAsset) {
    group.isExpanded = !group.isExpanded;
  }

  // ─── Totals ──────────────────────────────────────────────────────

  getTotalValueVND(): number {
    return this.groupedAssets.reduce((acc, g) => {
      let valVND = g.totalValue;
      if (g.currency === 'USD') valVND *= this.EXCHANGE_RATE;
      return acc + valVND;
    }, 0);
  }

  getTotalCostVND(): number {
    return this.groupedAssets.reduce((acc, g) => {
      if (g.type === AssetType.CASH) return acc;
      let costVND = g.totalCost;
      if (g.currency === 'USD') costVND *= this.EXCHANGE_RATE;
      return acc + costVND;
    }, 0);
  }

  getTotalProfitLossVND(): number {
    return this.getTotalValueVND() - this.getTotalCostVND();
  }

  getTotalProfitLossPercent(): number {
    const cost = this.getTotalCostVND();
    return cost > 0 ? (this.getTotalProfitLossVND() / cost) : 0;
  }

  // ─── Formatters ──────────────────────────────────────────────────

  onSellPriceChange(event: any) {
    const num = this.parseNumber(event.target.value);
    if (!isNaN(num)) this.displaySellPrice = this.formatNumber(num);
  }

  onPriceChange(event: any) {
    const numericValue = this.parseNumber(event.target.value);
    if (!isNaN(numericValue)) this.displayPrice = this.formatNumber(numericValue);
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

  calculateTotal(asset: AssetModel): number {
    return (asset.quantity || 0) * (asset.averagePrice || 0);
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
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
