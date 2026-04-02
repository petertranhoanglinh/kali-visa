import { Component, OnInit } from '@angular/core';
import { AssetService } from 'src/app/service/asset.service';
import { MarketPriceService } from 'src/app/service/market-price.service';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';
import { AssetModel } from 'src/app/model/asset.model';
import { MarketPriceModel } from 'src/app/model/market-price.model';

@Component({
  selector: 'app-price-settings',
  templateUrl: './price-settings.component.html',
  styleUrls: ['./price-settings.component.css']
})
export class PriceSettingsComponent implements OnInit {
  symbols: string[] = [];
  marketPrices: Map<string, number> = new Map();
  displayPrices: Map<string, string> = new Map();
  isLoading = false;
  symbolCurrencies: Map<string, string> = new Map(); // Track if symbol is USD or VND

  constructor(
    private assetService: AssetService,
    private marketPriceService: MarketPriceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) return;

    this.isLoading = true;
    // 1. Get all unique symbols user owns
    this.assetService.getAssetsByUser(userId).subscribe({
      next: (assets) => {
        this.symbols = Array.from(new Set(assets.map(a => a.symbol)));
        
        // Map symbols to their original currencies
        assets.forEach(a => {
          if (!this.symbolCurrencies.has(a.symbol)) {
            this.symbolCurrencies.set(a.symbol, a.currency || 'USD');
          }
        });
        
        // 2. Get current manual prices
        this.marketPriceService.getPricesByUser(userId).subscribe({
          next: (prices) => {
            prices.forEach(p => {
              this.marketPrices.set(p.symbol, p.price);
              this.displayPrices.set(p.symbol, this.formatNumber(p.price));
            });
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.toastr.error("Failed to load data");
        this.isLoading = false;
      }
    });
  }

  savePrice(symbol: string, priceStr: string) {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) return;

    const price = this.parseNumber(priceStr);
    if (isNaN(price)) {
      this.toastr.warning("Please enter a valid price");
      return;
    }

    const payload: MarketPriceModel = {
      userId: userId,
      symbol: symbol,
      price: price,
      currency: this.symbolCurrencies.get(symbol) || 'USD'
    };

    this.marketPriceService.updatePrice(payload).subscribe({
      next: () => {
        this.toastr.success(`Updated ${symbol} price successfully`);
        this.marketPrices.set(symbol, price);
        this.displayPrices.set(symbol, this.formatNumber(price));
      },
      error: () => this.toastr.error("Failed to update price")
    });
  }

  // --- Formatting Helpers ---

  onPriceInput(symbol: string, event: any) {
    const value = event.target.value;
    const numericValue = this.parseNumber(value);
    if (!isNaN(numericValue)) {
      this.displayPrices.set(symbol, this.formatNumber(numericValue));
    }
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  parseNumber(str: any): number {
    if (typeof str !== 'string' || !str) return 0;
    return parseFloat(str.replace(/,/g, ''));
  }

  getCurrencySymbol(symbol: string): string {
    const currency = this.symbolCurrencies.get(symbol) || 'USD';
    return currency === 'VND' ? '₫' : '$';
  }

  getCurrencyPipe(symbol: string): string {
    const currency = this.symbolCurrencies.get(symbol) || 'USD';
    return currency === 'VND' ? '1.0-0' : '1.2-2';
  }
}
