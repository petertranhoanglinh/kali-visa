import { Component, OnInit, HostListener } from '@angular/core';
import { NewsService } from 'src/app/service/news.service';
import { MarketNews } from 'src/app/model/market-news.model';
import { ToastrService } from 'ngx-toastr';

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
  selectedCategory: string = '';

  constructor(
    private newsService: NewsService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
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
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
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
