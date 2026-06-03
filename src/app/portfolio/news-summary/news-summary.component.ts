import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MarketNews } from 'src/app/model/market-news.model';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { NewsService } from 'src/app/service/news.service';

import {
  loadNews,
  loadNextPage,
  filterByCategory,
  invalidateNewsCache,
} from 'src/app/actions/news.actions';
import {
  selectNewsItems,
  selectNewsIsLoading,
  selectNewsIsLoadingMore,
  selectNewsIsLastPage,
  selectNewsCurrentPage,
  selectNewsCategory,
} from 'src/app/selectors/news.selector';

@Component({
  selector: 'app-news-summary',
  templateUrl: './news-summary.component.html',
  styleUrls: ['./news-summary.component.css']
})
export class NewsSummaryComponent implements OnInit, OnDestroy {

  readonly PAGE_SIZE = 10;

  // Streams từ store
  newsItems$: Observable<MarketNews[]>;
  isLoading$: Observable<boolean>;
  isLoadingMore$: Observable<boolean>;
  isLastPage$: Observable<boolean>;

  // Local state
  isAdmin = false;
  isPremium = false;
  today: Date = new Date();

  private currentPage = 0;
  private selectedCategory = '';
  private isLastPage = false;
  private isLoadingMore = false;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private newsService: NewsService,
    private toastr: ToastrService,
  ) {
    this.newsItems$      = this.store.select(selectNewsItems);
    this.isLoading$      = this.store.select(selectNewsIsLoading);
    this.isLoadingMore$  = this.store.select(selectNewsIsLoadingMore);
    this.isLastPage$     = this.store.select(selectNewsIsLastPage);
  }

  ngOnInit(): void {
    const user = AuthDetail.getLoginedInfo();
    this.isAdmin   = user && user.role === 'ADMIN';
    this.isPremium = true; // CommonUtils.checkPremiumStatus(user)

    // Giữ track state cục bộ để dùng trong HostListener
    this.store.select(selectNewsCurrentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => this.currentPage = p);

    this.store.select(selectNewsIsLastPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe(last => this.isLastPage = last);

    this.store.select(selectNewsIsLoadingMore)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoadingMore = loading);

    this.store.select(selectNewsCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe(cat => this.selectedCategory = cat);

    // Dispatch load — Effect tự kiểm tra cache
    this.store.dispatch(loadNews({
      page: 0,
      size: this.PAGE_SIZE,
      category: this.selectedCategory,
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight - 200) {
      if (!this.isLastPage && !this.isLoadingMore) {
        this.store.dispatch(loadNextPage({
          page: this.currentPage + 1,
          size: this.PAGE_SIZE,
          category: this.selectedCategory,
        }));
      }
    }
  }

  onFilterByCategory(category: string) {
    if (category === this.selectedCategory) return; // Không reload nếu cùng category
    this.store.dispatch(filterByCategory({ category, size: this.PAGE_SIZE }));
  }

  forceRefresh() {
    this.toastr.info('Đang yêu cầu AI tổng hợp tin mới...');
    this.newsService.forceGenerate().subscribe({
      next: () => {
        this.toastr.success('Đang biên tập tin mới. Vui lòng chờ giây lát...');
        setTimeout(() => {
          this.store.dispatch(invalidateNewsCache());
          this.store.dispatch(loadNews({
            page: 0,
            size: this.PAGE_SIZE,
            category: this.selectedCategory,
          }));
        }, 5000);
      },
      error: () => this.toastr.error('Có lỗi xảy ra khi gọi AI.')
    });
  }
}
