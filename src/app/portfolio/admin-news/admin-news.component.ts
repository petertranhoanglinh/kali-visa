import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/service/news.service';
import { MarketNews } from 'src/app/model/market-news.model';
import { ToastrService } from 'ngx-toastr';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.css']
})
export class AdminNewsComponent implements OnInit {
  newsList: MarketNews[] = [];
  showModal = false;
  isEdit = false;
  isGenerating = false;
  public Editor: any = (DecoupledEditor as any).default || DecoupledEditor;

  onReady(editor: any): void {
    const toolbarElement = editor.ui.view.toolbar.element;
    const editableElement = editor.ui.getEditableElement();
    editableElement.parentElement.insertBefore(toolbarElement, editableElement);
  }

  currentPage = 0;
  totalPages = 0;
  pageSize = 10;
  selectedIds = new Set<string>();
  currentNews: MarketNews = this.resetNews();

  constructor(private newsService: NewsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadNews();
  }

  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isItemSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  isAllSelected(): boolean {
    return this.newsList.length > 0 && this.newsList.every(item => this.selectedIds.has(item.id!));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.newsList.forEach(item => this.selectedIds.delete(item.id!));
    } else {
      this.newsList.forEach(item => this.selectedIds.add(item.id!));
    }
  }

  deleteSelected() {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return;

    if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} bài viết đã chọn không?`)) {
      this.newsService.deleteMultipleNews(ids).subscribe({
        next: () => {
          this.toastr.success(`Đã xóa ${ids.length} bài viết.`);
          this.selectedIds.clear();
          this.loadNews();
        },
        error: () => this.toastr.error("Không thể xóa các bài viết đã chọn")
      });
    }
  }

  generateAINews() {
    this.isGenerating = true;
    this.newsService.forceGenerate().subscribe({
      next: (res) => {
        this.toastr.success("Hệ thống AI đã bắt đầu tạo tin tức!");
        this.isGenerating = false;
        // Chờ 1 chút rồi load lại danh sách
        setTimeout(() => this.loadNews(), 3000);
      },
      error: () => {
        this.toastr.error("Có lỗi khi gọi AI tạo tin tức.");
        this.isGenerating = false;
      }
    });
  }

  loadNews() {
    this.newsService.getNews(this.currentPage, this.pageSize).subscribe(res => {
      this.newsList = res.content;
      this.totalPages = res.totalPages;
    });
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.selectedIds.clear();
      this.loadNews();
      window.scrollTo(0, 0);
    }
  }

  resetNews(): MarketNews {
    return {
      title: '',
      content: '',
      summary: '',
      category: 'MACRO',
      sentiment: 'NEUTRAL',
      imageUrl: '',
      aiScore: 5,
      createdAt: new Date()
    };
  }

  openCreateModal() {
    this.isEdit = false;
    this.currentNews = this.resetNews();
    this.showModal = true;
  }

  openEditModal(news: MarketNews) {
    this.isEdit = true;
    this.currentNews = { ...news };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveNews() {
    if (!this.currentNews.title || !this.currentNews.content) {
      this.toastr.warning("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }

    if (this.isEdit) {
      this.newsService.updateNews(this.currentNews.id!, this.currentNews).subscribe({
        next: () => {
          this.toastr.success("Đã cập nhật bài viết!");
          this.loadNews();
          this.closeModal();
        },
        error: () => this.toastr.error("Không thể cập nhật bài viết")
      });
    } else {
      this.newsService.createNews(this.currentNews).subscribe({
        next: () => {
          this.toastr.success("Đã đăng bài viết mới!");
          this.loadNews();
          this.closeModal();
        },
        error: () => this.toastr.error("Không thể đăng bài viết")
      });
    }
  }

  deleteNews(id: string) {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      this.newsService.deleteNews(id).subscribe({
        next: () => {
          this.toastr.success("Đã xóa bài viết.");
          this.loadNews();
        },
        error: () => this.toastr.error("Không thể xóa bài viết")
      });
    }
  }

  getSentimentClass(sentiment?: string) {
    if (!sentiment) return 'sentiment-neutral';
    return `sentiment-${sentiment.toLowerCase()}`;
  }
}
