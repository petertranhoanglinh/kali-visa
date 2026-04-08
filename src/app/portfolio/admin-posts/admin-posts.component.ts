import { Component, OnInit } from '@angular/core';
import { SocialService } from 'src/app/service/social.service';
import { PostModel } from 'src/app/model/social.model';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-admin-posts',
  template: `
    <div class="container-fluid mt-4 pb-5">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <h2 class="text-uppercase fw-bold text-primary mb-0 fs-4 fs-md-2">Quản lý thảo luận</h2>
        <div class="d-flex flex-wrap gap-2">
          <button *ngIf="selectedIds.size > 0" class="btn btn-danger btn-sm btn-md-lg px-3 px-md-4 text-uppercase fw-bold animate-fade" (click)="deleteSelected()">
            <i class="fas fa-trash-alt me-1 me-md-2"></i> <span class="d-none d-sm-inline">Xóa</span> {{ selectedIds.size }} <span class="d-none d-sm-inline">mục</span>
          </button>
          <button class="btn btn-outline-secondary btn-sm btn-md-lg px-3 px-md-4 text-uppercase fw-bold" (click)="loadPosts()">
            <i class="fas fa-sync-alt me-1 me-md-2"></i> Làm mới
          </button>
        </div>
      </div>

      <!-- Desktop Table List -->
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
                  <th>Tác giả</th>
                  <th>Nội dung</th>
                  <th>Ngày đăng</th>
                  <th>Tương tác</th>
                  <th class="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of postList" [class.table-active]="isItemSelected(item.id!)">
                  <td class="ps-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [checked]="isItemSelected(item.id!)" (change)="toggleSelect(item.id!)">
                    </div>
                  </td>
                  <td>
                    <div class="fw-bold">{{ item.authorName }}</div>
                    <small class="text-muted">{{ item.authorId }}</small>
                  </td>
                  <td class="py-3">
                    <div class="text-dark line-clamp-2" [innerHTML]="item.content"></div>
                  </td>
                  <td>{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <i class="fas fa-heart text-danger me-1"></i> {{ item.likes?.length || 0 }}
                    <i class="fas fa-comment text-primary ms-2 me-1"></i> {{ item.comments?.length || 0 }}
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-2" (click)="openEditModal(item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deletePost(item.id!)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Mobile Card List -->
      <div class="d-md-none">
        <div class="card mb-3 shadow-sm border-0 overflow-hidden" *ngFor="let item of postList" [class.border-primary]="isItemSelected(item.id!)">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" [checked]="isItemSelected(item.id!)" (change)="toggleSelect(item.id!)">
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-light text-primary" (click)="openEditModal(item)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-light text-danger" (click)="deletePost(item.id!)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="mb-2">
                <span class="fw-bold fs-6">{{ item.authorName }}</span>
                <span class="ms-2 small text-muted">{{ item.createdAt | date:'dd/MM HH:mm' }}</span>
            </div>
            <div class="text-muted small mb-2 line-clamp-3" [innerHTML]="item.content"></div>
            <div class="d-flex gap-3 text-muted small mt-2">
                <span><i class="fas fa-heart"></i> {{ item.likes?.length || 0 }}</span>
                <span><i class="fas fa-comment"></i> {{ item.comments?.length || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3" *ngIf="totalPages > 0">
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
      <div *ngIf="totalPages === 0 && !isLoading" class="text-center py-5 text-muted">
         Chưa có thảo luận nào.
      </div>

      <!-- Modal Soạn thảo -->
      <div class="admin-modal" *ngIf="showModal">
        <div class="admin-modal-content card shadow-lg border-0">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 px-3 px-md-4">
            <h5 class="mb-0 text-uppercase fw-bold fs-6 fs-md-5">Chỉnh sửa nội dung thảo luận</h5>
            <button class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>
          <div class="card-body p-3 p-md-4" style="max-height: 75vh; overflow-y: auto;">
            <div class="row g-3">
              <div class="col-12">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="avatar-small">{{ currentPost.authorName?.charAt(0) }}</div>
                    <div>
                        <div class="fw-bold">{{ currentPost.authorName }}</div>
                        <small class="text-muted">{{ currentPost.authorId }}</small>
                    </div>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Nội dung bài viết</label>
                <div class="editor-wrapper border rounded">
                  <ckeditor [editor]="Editor" [ngModel]="currentPost.content" (ngModelChange)="currentPost.content = $any($event)" (ready)="onReady($event)"></ckeditor>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-light p-3 text-end d-flex justify-content-end gap-2">
            <button class="btn btn-secondary text-uppercase fw-bold px-3 px-md-4" (click)="closeModal()">Đóng</button>
            <button class="btn btn-primary text-uppercase fw-bold px-3 px-md-4" (click)="savePost()">Lưu thay đổi</button>
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
    .avatar-small {
        width: 40px; height: 40px; background: #6366f1; color: white;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-weight: bold;
    }
    
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
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
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
    .animate-fade {
        animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
        from { opacity: 0; } to { opacity: 1; }
    }
  `]
})
export class AdminPostsComponent implements OnInit {
  postList: PostModel[] = [];
  showModal = false;
  isLoading = false;
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
  currentPost: PostModel = this.resetPost();

  constructor(private socialService: SocialService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadPosts();
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
    return this.postList.length > 0 && this.postList.every(item => this.selectedIds.has(item.id!));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.postList.forEach(item => this.selectedIds.delete(item.id!));
    } else {
      this.postList.forEach(item => this.selectedIds.add(item.id!));
    }
  }

  deleteSelected() {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return;

    if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} thảo luận đã chọn không?`)) {
      const user = AuthDetail.getLoginedInfo();
      this.socialService.deleteMultiplePosts(ids, user.id).subscribe({
        next: () => {
          this.toastr.success(`Đã xóa ${ids.length} bài thảo luận.`);
          this.selectedIds.clear();
          this.loadPosts();
        },
        error: () => this.toastr.error("Không thể xóa các thảo luận đã chọn")
      });
    }
  }

  loadPosts() {
    this.isLoading = true;
    this.socialService.getAllPosts(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.postList = res.content;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error("Lỗi khi tải danh sách thảo luận");
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.selectedIds.clear();
      this.loadPosts();
      window.scrollTo(0, 0);
    }
  }

  resetPost(): PostModel {
    return {
      authorId: '',
      authorName: '',
      content: '',
      createdAt: new Date().toISOString()
    };
  }

  openEditModal(post: PostModel) {
    this.currentPost = { ...post };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  savePost() {
    if (!this.currentPost.content) {
      this.toastr.warning("Nội dung không được để trống.");
      return;
    }

    const user = AuthDetail.getLoginedInfo();
    this.socialService.updatePost(this.currentPost.id!, this.currentPost, user.id).subscribe({
      next: () => {
        this.toastr.success("Đã cập nhật bài thảo luận!");
        this.loadPosts();
        this.closeModal();
      },
      error: () => this.toastr.error("Không thể cập nhật bài thảo luận")
    });
  }

  deletePost(id: string) {
    if (confirm("Bạn có chắc chắn muốn xóa thảo luận này không?")) {
      const user = AuthDetail.getLoginedInfo();
      this.socialService.deletePost(id, user.id).subscribe({
        next: () => {
          this.toastr.success("Đã xóa thảo luận.");
          this.loadPosts();
        },
        error: () => this.toastr.error("Không thể xóa thảo luận")
      });
    }
  }
}
