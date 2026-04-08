import { Component, OnInit, HostListener } from '@angular/core';
import { NewsService } from 'src/app/service/news.service';
import { MarketNews } from 'src/app/model/market-news.model';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';

@Component({
  selector: 'app-news-summary',
  templateUrl: './news-summary.component.html',
  styleUrls: ['./news-summary.component.css']
})
export class NewsSummaryComponent implements OnInit {

  newsItems: MarketNews[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  isLastPage: boolean = false;
  isLoading: boolean = false;
  isAdmin: boolean = false;
  isPremium: boolean = false;
  selectedCategory: string = '';
  today: Date = new Date();

  constructor(
    private newsService: NewsService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const user = AuthDetail.getLoginedInfo();
    this.isAdmin = user && user.role === 'ADMIN';
    this.isPremium = CommonUtils.checkPremiumStatus(user);
    this.loadNews();
  }

  loadNews(isNextPage: boolean = false) {
    if (this.isLoading || (isNextPage && this.isLastPage)) return;

    this.isLoading = true;
    if (isNextPage) {
      this.currentPage++;
    } else {
      this.currentPage = 0;
      this.newsItems = [];
    }

    this.newsService.getNews(this.currentPage, this.pageSize, this.selectedCategory).subscribe({
      next: (res) => {
        this.newsItems = [...this.newsItems, ...res.content];
        this.isLastPage = res.last;

        // --- PRO Limit: Max 10 news items for Non-PRO ---
        if (!this.isPremium && this.newsItems.length >= 10) {
          this.isLastPage = true;
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error("Không thể tải tin tức.");
        this.isLoading = false;
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Trigger when 200px from the bottom
    if (scrollPosition >= documentHeight - 200) {
      if (!this.isLastPage && !this.isLoading) {
        this.loadNews(true);
      }
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.loadNews();
  }

  forceRefresh() {
    this.toastr.info("Đang yêu cầu AI tổng hợp tin mới...");
    this.newsService.forceGenerate().subscribe({
      next: () => {
        this.toastr.success("Đang biên tập tin mới. Vui lòng chờ giây lát rồi tải lại.");
        setTimeout(() => this.loadNews(), 5000);
      },
      error: () => this.toastr.error("Có lỗi xảy ra khi gọi AI.")
    });
  }
}
