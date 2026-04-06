import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/service/news.service';
import { MarketNews } from 'src/app/model/market-news.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-news',
  template: `
    <div class="container-fluid mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-uppercase fw-bold text-primary mb-0">Quản lý bài viết</h2>
        <button class="btn btn-success btn-lg px-4 text-uppercase fw-bold" (click)="openCreateModal()">
          <i class="fas fa-plus me-2"></i> Viết bài mới
        </button>
      </div>

      <!-- Bảng danh sách bài viết -->
      <div class="card shadow-sm border-0">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-4">Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Ngày đăng</th>
                  <th>Thị trường</th>
                  <th class="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of newsList">
                  <td class="ps-4 py-3">
                    <div class="fw-bold text-dark">{{ item.title }}</div>
                    <small class="text-muted">{{ item.summary | slice:0:100 }}...</small>
                  </td>
                  <td><span class="badge bg-info text-white text-uppercase">{{ item.category }}</span></td>
                  <td>{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <span [class]="getSentimentClass(item.sentiment)">
                      {{ item.sentiment || 'NEUTRAL' }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-2" (click)="openEditModal(item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteNews(item.id!)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Soạn thảo (Simple Implementation using *ngIf for demo) -->
      <div class="admin-modal" *ngIf="showModal">
        <div class="admin-modal-content card shadow-lg border-0">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-uppercase">{{ isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới' }}</h5>
            <button class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>
          <div class="card-body p-4" style="max-height: 80vh; overflow-y: auto;">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-bold">Tiêu đề bài viết</label>
                <input type="text" class="form-control" [(ngModel)]="currentNews.title">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Danh mục</label>
                <select class="form-select" [(ngModel)]="currentNews.category">
                  <option value="MACRO">Vĩ mô</option>
                  <option value="STOCKS">Chứng khoán</option>
                  <option value="CRYPTO">Tiền điện tử</option>
                  <option value="FED">FED / Lãi suất</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Xu hướng</label>
                <select class="form-select" [(ngModel)]="currentNews.sentiment">
                  <option value="BULLISH">Tích cực (Bullish)</option>
                  <option value="BEARISH">Tiêu cực (Bearish)</option>
                  <option value="NEUTRAL">Trung lập</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Ảnh đại diện (URL)</label>
                <input type="text" class="form-control" [(ngModel)]="currentNews.imageUrl">
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Tóm tắt ngắn (Khuyến khích sale tốt)</label>
                <textarea class="form-control" rows="2" [(ngModel)]="currentNews.summary"></textarea>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Nội dung chi tiết (HTML/Text)</label>
                <textarea class="form-control" rows="10" [(ngModel)]="currentNews.content"></textarea>
              </div>
            </div>
          </div>
          <div class="card-footer bg-light p-3 text-end">
            <button class="btn btn-secondary me-2 text-uppercase fw-bold" (click)="closeModal()">Hủy bỏ</button>
            <button class="btn btn-primary text-uppercase fw-bold px-4" (click)="saveNews()">Lưu bài viết</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); z-index: 1050; display: flex; align-items: center; justify-content: center;
    }
    .admin-modal-content { width: 90%; max-width: 800px; }
    .badge { font-size: 0.75rem; padding: 0.4em 0.8em; }
    .sentiment-bullish { color: #10b981; font-weight: bold; }
    .sentiment-bearish { color: #ef4444; font-weight: bold; }
    .sentiment-neutral { color: #6b7280; font-weight: bold; }
  `]
})
export class AdminNewsComponent implements OnInit {
  newsList: MarketNews[] = [];
  showModal = false;
  isEdit = false;
  currentNews: MarketNews = this.resetNews();

  constructor(private newsService: NewsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews() {
    this.newsService.getNews(0, 50).subscribe(res => {
      this.newsList = res.content;
    });
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
