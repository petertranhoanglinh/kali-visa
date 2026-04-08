import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/service/news.service';
import { MarketNews } from 'src/app/model/market-news.model';
import { ToastrService } from 'ngx-toastr';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-admin-news',
  template: `
    <div class="container-fluid mt-4 pb-5">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <h2 class="text-uppercase fw-bold text-primary mb-0 fs-4 fs-md-2">Quản lý bài viết</h2>
        <div class="d-flex flex-wrap gap-2">
          <button *ngIf="selectedIds.size > 0" class="btn btn-danger btn-sm btn-md-lg px-3 px-md-4 text-uppercase fw-bold animate-fade" (click)="deleteSelected()">
            <i class="fas fa-trash-alt me-1 me-md-2"></i> <span class="d-none d-sm-inline">Xóa</span> {{ selectedIds.size }} <span class="d-none d-sm-inline">mục</span>
          </button>
          <button class="btn btn-outline-primary btn-sm btn-md-lg px-3 px-md-4 text-uppercase fw-bold" (click)="generateAINews()" [disabled]="isGenerating">
            <i class="fas" [class.fa-robot]="!isGenerating" [class.fa-spinner]="isGenerating" [class.fa-spin]="isGenerating"></i> 
            <span class="ms-1 ms-md-2">{{ isGenerating ? 'AI...' : 'Tạo bài AI' }}</span>
          </button>
          <button class="btn btn-success btn-sm btn-md-lg px-3 px-md-4 text-uppercase fw-bold" (click)="openCreateModal()">
            <i class="fas fa-plus me-1 me-md-2"></i> Viết bài mới
          </button>
        </div>
      </div>

      <!-- Desktop Table List (Visible on md and up) -->
      <div class="card shadow-sm border-0 d-none d-md-block">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-4" style="width: 40px;">
                    <div class="form-check">
                      <input class="form-check-input mt-0" type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll()">
                    </div>
                  </th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Ngày đăng</th>
                  <th>Thị trường</th>
                  <th class="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of newsList" [class.table-active]="isItemSelected(item.id!)">
                  <td class="ps-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [checked]="isItemSelected(item.id!)" (change)="toggleSelect(item.id!)">
                    </div>
                  </td>
                  <td class="py-3">
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

      <!-- Mobile Card List (Visible on sm and down) -->
      <div class="d-md-none">
        <div class="card mb-3 shadow-sm border-0 overflow-hidden" *ngFor="let item of newsList" [class.border-primary]="isItemSelected(item.id!)">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" [checked]="isItemSelected(item.id!)" (change)="toggleSelect(item.id!)">
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-light text-primary" (click)="openEditModal(item)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-light text-danger" (click)="deleteNews(item.id!)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <h6 class="fw-bold mb-1">{{ item.title }}</h6>
            <p class="text-muted small mb-2 line-clamp-2">{{ item.summary }}</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span class="badge bg-light text-dark border text-uppercase">{{ item.category }}</span>
              <span class="small text-muted">{{ item.createdAt | date:'dd/MM HH:mm' }}</span>
              <span [class]="getSentimentClass(item.sentiment)" class="small">
                {{ item.sentiment || 'NEUTRAL' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="mt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
        <span class="text-muted small">Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" [class.disabled]="currentPage === 0">
              <button class="page-link px-3" (click)="onPageChange(currentPage - 1)">Trước</button>
            </li>
            <li class="page-item active"><span class="page-link px-3">{{ currentPage + 1 }}</span></li>
            <li class="page-item" [class.disabled]="currentPage >= totalPages - 1">
              <button class="page-link px-3" (click)="onPageChange(currentPage + 1)">Sau</button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Modal Soạn thảo -->
      <div class="admin-modal" *ngIf="showModal">
        <div class="admin-modal-content card shadow-lg border-0">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 px-3 px-md-4">
            <h5 class="mb-0 text-uppercase fw-bold fs-6 fs-md-5">{{ isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới' }}</h5>
            <button class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>
          <div class="card-body p-3 p-md-4" style="max-height: 75vh; overflow-y: auto;">
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
                <label class="form-label fw-bold">Tóm tắt ngắn</label>
                <textarea class="form-control" rows="2" [(ngModel)]="currentNews.summary"></textarea>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Nội dung chi tiết (Copy bài vào đây)</label>
                <div class="editor-wrapper border rounded">
                  <ckeditor [editor]="Editor" [(ngModel)]="currentNews.content" (ready)="onReady($event)"></ckeditor>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-light p-3 text-end d-flex justify-content-end gap-2">
            <button class="btn btn-secondary text-uppercase fw-bold px-3 px-md-4" (click)="closeModal()">Đóng</button>
            <button class="btn btn-primary text-uppercase fw-bold px-3 px-md-4" (click)="saveNews()">Lưu bài</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 1050; display: flex; align-items: center; justify-content: center;
      padding: 10px;
    }
    .admin-modal-content { 
      width: 100%; 
      max-width: 900px; 
      max-height: 95vh;
    }
    .badge { font-size: 0.7rem; padding: 0.4em 0.7em; }
    .sentiment-bullish { color: #10b981; font-weight: bold; }
    .sentiment-bearish { color: #ef4444; font-weight: bold; }
    .sentiment-neutral { color: #6b7280; font-weight: bold; }
    
    .editor-wrapper {
      background: white;
    }
    ::ng-deep .ck-editor__editable {
      min-height: 300px;
      max-height: 50vh;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      ::ng-deep .ck-editor__editable {
        min-height: 200px;
      }
      .admin-modal-content {
        margin: 5px;
      }
    }
  `]
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
