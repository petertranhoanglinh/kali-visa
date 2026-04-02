import { Component, OnInit } from '@angular/core';
import { AssetService } from 'src/app/service/asset.service';
import { AssetModel, AssetType } from 'src/app/model/asset.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';
import { MarketPriceService } from 'src/app/service/market-price.service';
import { MarketPriceModel } from 'src/app/model/market-price.model';

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
  assetTypes = Object.values(AssetType);
  
  private EXCHANGE_RATE = 25000; // 1 USD = 25,000 VND
  
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
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    this.userTier = loginInfo?.tier || 'BASIC';
    this.loadAssets();
  }

  loadAssets() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (userId) {
      this.assetService.getAssetsByUser(userId).subscribe({
        next: (res) => {
          this.assets = res;
          
          if (this.userTier === 'BASIC') {
            this.marketPriceService.getPricesByUser(userId).subscribe({
              next: (prices) => {
                prices.forEach(p => this.marketPrices.set(p.symbol, p.price));
                this.groupAssets();
              },
              error: () => this.groupAssets()
            });
          } else {
            this.groupAssets();
          }
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
      if (asset.isSell) {
        group.totalQuantity -= (asset.quantity || 0);
      } else {
        group.totalQuantity += (asset.quantity || 0);
        group.totalCost += ((asset.quantity || 0) * (asset.averagePrice || 0));
      }
    });

    this.groupedAssets = Array.from(groups.values()).map(group => {
      // Calculate Average Cost Basis only from remaining Buy transactions if needed,
      // but standard weighted average cost used for totalCost.
      if (group.totalQuantity > 0 && group.totalCost > 0) {
        // We keep the cost basis from the Buy transactions
        group.averagePrice = group.totalCost / (group.history.filter(h => !h.isSell).reduce((s, h) => s + (h.quantity || 0), 0) || 1);
      }
      
      // Calculate Market Value based on current total quantity
      const currentPrice = this.marketPrices.get(group.symbol) || group.averagePrice;
      group.marketPrice = currentPrice;
      group.totalValue = group.totalQuantity * currentPrice;
      
      // Total Cost for display = Remaining Quantity * Avg Cost
      group.totalCost = group.totalQuantity * group.averagePrice;

      // Sort history by date descending
      group.history.sort((a, b) => {
        const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
        const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
        return dateB - dateA;
      });
      return group;
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
    // Parse the display price back to number
    this.newAsset.averagePrice = this.parseNumber(this.displayPrice);

    // If user didn't pick a date, default to now (though the input should have it)
    if (!this.newAsset.purchaseDate) {
      this.newAsset.purchaseDate = new Date().toISOString();
    }
    
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
      let val = g.totalValue;
      if (g.history[0].currency === 'USD') val *= this.EXCHANGE_RATE;
      return acc + val;
    }, 0);
  }

  getTotalCostVND(): number {
  return this.groupedAssets.reduce((acc, g) => {
    // 1. Vẫn bỏ qua nếu là tiền mặt
    if (g.type === AssetType.CASH) return acc;

    // 2. Chỉ tính tổng các giao dịch có type là 'BUY' (hoặc giá trị tương ứng của bạn)
    const buyCost = g.history.reduce((sum, record) => {
      if (!record.isSell) { // Thay 'BUY' bằng enum hoặc string chuẩn của bạn
        let amount = record.averagePrice * record.quantity; // Giả sử totalPrice là số tiền bỏ ra cho lệnh đó
        if (record.currency === 'USD') {
          amount *= this.EXCHANGE_RATE;
        }
        return sum + amount;
      }
      return sum;
    }, 0);

    return acc + buyCost;
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
