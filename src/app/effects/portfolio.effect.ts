import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, filter } from 'rxjs/operators';

import { AssetService } from '../service/asset.service';
import { MarketPriceService } from '../service/market-price.service';
import { SystemConfigService } from '../service/system-config.service';
import { AuthDetail } from '../common/util/auth-detail';

import {
  loadPortfolioData,
  loadPortfolioDataSuccess,
  loadPortfolioDataFailure,
  loadRealtimePrices,
  loadRealtimePricesSuccess,
  refreshPortfolioData,
} from '../actions/portfolio.actions';
import { selectIsLoaded } from '../selectors/portfolio.selector';

@Injectable()
export class PortfolioEffect {

  constructor(
    private actions$: Actions,
    private store: Store,
    private assetService: AssetService,
    private marketPriceService: MarketPriceService,
    private configService: SystemConfigService,
  ) {}

  /**
   * Load portfolio data - chỉ gọi API khi chưa có cache (isLoaded = false).
   * Dùng withLatestFrom để kiểm tra state trước khi fetch.
   */
  loadPortfolio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPortfolioData),
      withLatestFrom(this.store.select(selectIsLoaded)),
      // Nếu đã loaded → bỏ qua, không gọi API
      filter(([, isLoaded]) => !isLoaded),
      switchMap(() => this._fetchPortfolioData())
    )
  );

  /**
   * Refresh force reload (sau add/delete/sell) - luôn gọi API bất kể cache.
   */
  refreshPortfolio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshPortfolioData),
      switchMap(() => this._fetchPortfolioData())
    )
  );

  /**
   * Load realtime prices cho PRO users (STOCK, CRYPTO).
   */
  loadRealtimePrices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRealtimePrices),
      switchMap(({ symbols, types }) =>
        this.assetService.getRealtimePrices(symbols, types).pipe(
          map(priceMap => loadRealtimePricesSuccess({ priceMap })),
          catchError(() => of(loadRealtimePricesSuccess({ priceMap: {} })))
        )
      )
    )
  );

  private _fetchPortfolioData() {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) {
      return of(loadPortfolioDataFailure({ error: 'User not logged in' }));
    }

    // Gọi song song 3 API cùng lúc
    return forkJoin({
      assets: this.assetService.getAssetsByUser(userId),
      marketPrices: this.marketPriceService.getPricesByUser(userId),
      config: this.configService.getConfig('USD_VND_RATE'),
    }).pipe(
      map(({ assets, marketPrices, config }) =>
        loadPortfolioDataSuccess({
          assets,
          marketPrices,
          exchangeRate: config?.configValue ? Number(config.configValue) : 25000,
        })
      ),
      catchError(err =>
        of(loadPortfolioDataFailure({ error: err.message || 'Load failed' }))
      )
    );
  }
}
