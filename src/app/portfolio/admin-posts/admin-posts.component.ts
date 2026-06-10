import { Component, OnInit } from '@angular/core';
import { SocialService } from 'src/app/service/social.service';
import { PostModel } from 'src/app/model/social.model';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-admin-posts',
  templateUrl: './admin-posts.component.html',
  styleUrls: ['./admin-posts.component.css']
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
