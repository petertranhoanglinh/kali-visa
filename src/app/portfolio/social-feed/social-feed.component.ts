import { Component, OnInit, HostListener } from '@angular/core';
import { SocialService } from 'src/app/service/social.service';
import { PostModel, CommentModel } from 'src/app/model/social.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.css']
})
export class SocialFeedComponent implements OnInit {

  public Editor: any = (DecoupledEditor as any).default || DecoupledEditor;
  posts: PostModel[] = [];

  onReady(editor: any): void {
    const toolbarElement = editor.ui.view.toolbar.element;
    const editableElement = editor.ui.getEditableElement();

    // Thêm toolbar vào DOM (Decoupled layout)
    editableElement.parentElement.insertBefore(toolbarElement, editableElement);
  }
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  isLoadingPosts: boolean = false;
  hasMorePosts: boolean = true;
  filterMode: 'ALL' | 'MINE' = 'ALL';
  
  // Post Creator
  newPostContent: string = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  previewType: 'IMAGE' | 'VIDEO' | 'NONE' = 'NONE';
  isUploading: boolean = false;

  currentUserId: string = '';
  currentUserName: string = 'Nhà Đầu Tư ẩn danh';

  // Edit Mode
  editingPostId: string | null = null;
  editingPostContent: string = '';

  // Comments
  newCommentContent: { [postId: string]: string } = {};

  constructor(
    private socialService: SocialService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const user = AuthDetail.getLoginedInfo();
    if (user) {
      this.currentUserId = user.id;
      this.currentUserName = user.email || 'Nhà Đầu Tư ẩn danh';
    }
    this.loadFeed(true);
  }

  setFilterMode(mode: 'ALL' | 'MINE') {
    if (this.filterMode === mode) return;
    this.filterMode = mode;
    if (this.filterMode === 'MINE' && !this.currentUserId) {
      this.toastr.warning("Vui lòng đăng nhập để xem bài gốc của bạn.");
      this.filterMode = 'ALL';
      return;
    }
    this.loadFeed(true);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.isLoadingPosts || !this.hasMorePosts) return;
    
    // Check if scrolled near bottom (e.g. within 200px of bottom)
    const scrolledPosition = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;
    if (scrolledPosition >= bodyHeight - 200) {
      this.loadFeed(false);
    }
  }

  loadFeed(isFirstLoad: boolean = false) {
    if (isFirstLoad) {
      this.currentPage = 0;
      this.posts = [];
      this.hasMorePosts = true;
    }
    
    if (this.isLoadingPosts || !this.hasMorePosts) return;
    
    this.isLoadingPosts = true;

    const queryAuthorId = this.filterMode === 'MINE' ? this.currentUserId : undefined;

    this.socialService.getAllPosts(this.currentPage, this.pageSize, queryAuthorId).subscribe({
      next: (res: any) => {
        const newPosts: PostModel[] = res.content || [];
        this.posts = [...this.posts, ...newPosts];
        this.hasMorePosts = !res.last; // Spring Data Page returns 'last' boolean flag
        this.currentPage++;
        this.isLoadingPosts = false;
      },
      error: () => {
        this.toastr.error("Lỗi khi tải bảng tin!");
        this.isLoadingPosts = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        this.toastr.warning("File quá lớn (Tối đa 100MB)");
        return;
      }
      this.selectedFile = file;
      
      // Determine type for preview
      if (file.type.startsWith('image/')) {
        this.previewType = 'IMAGE';
      } else if (file.type.startsWith('video/')) {
        this.previewType = 'VIDEO';
      } else {
        this.previewType = 'NONE';
        this.toastr.warning("Chỉ hỗ trợ hình ảnh hoặc video");
        this.selectedFile = null;
        return;
      }

      // Generate preview
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.previewType = 'NONE';
  }

  submitPost() {
    if (!this.newPostContent.trim() && !this.selectedFile) {
      this.toastr.warning("Vui lòng nhập nội dung hoặc đính kèm ảnh/video.");
      return;
    }

    if (!this.currentUserId) {
      this.toastr.error("Vui lòng đăng nhập để đăng bài.");
      return;
    }

    this.isUploading = true;

    if (this.selectedFile) {
      this.socialService.uploadFile(this.selectedFile).subscribe({
        next: (res) => {
          this.createPostCall(res.url, res.type as any);
        },
        error: (err) => {
          this.toastr.error("Lỗi upload file: " + (err.error?.error || 'Unknown'));
          this.isUploading = false;
        }
      });
    } else {
      this.createPostCall('', 'NONE');
    }
  }

  private createPostCall(mediaUrl: string, mediaType: 'IMAGE'|'VIDEO'|'NONE') {
    const post: PostModel = {
      authorId: this.currentUserId,
      authorName: this.currentUserName,
      content: this.newPostContent,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      likes: []
    };

    this.socialService.createPost(post).subscribe({
      next: (res) => {
        this.toastr.success("Đã đăng bài thành công!");
        this.newPostContent = '';
        this.clearFile();
        this.isUploading = false;
        this.loadFeed(); // Reload to get new post at top
      },
      error: () => {
        this.toastr.error("Lỗi khi đăng bài!");
        this.isUploading = false;
      }
    });
  }

  deletePost(post: PostModel) {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
      this.socialService.deletePost(post.id!, this.currentUserId).subscribe({
        next: () => {
          this.toastr.success("Đã xóa bài viết.");
          // Remove locally without reloading
          this.posts = this.posts.filter(p => p.id !== post.id);
        },
        error: () => this.toastr.error("Lỗi khi xóa bài viết.")
      });
    }
  }

  startEdit(post: PostModel) {
    this.editingPostId = post.id!;
    this.editingPostContent = post.content || '';
  }

  cancelEdit() {
    this.editingPostId = null;
    this.editingPostContent = '';
  }

  saveEdit(post: PostModel) {
    if (!this.editingPostContent.trim()) {
      this.toastr.warning("Nội dung không được để trống.");
      return;
    }

    const updatedPost = { ...post, content: this.editingPostContent };
    this.socialService.updatePost(post.id!, updatedPost, this.currentUserId).subscribe({
      next: (res) => {
        post.content = res.content; // Cập nhật nội dung tại chỗ
        this.toastr.success("Đã cập nhật bài viết.");
        this.cancelEdit();
      },
      error: () => this.toastr.error("Lỗi khi cập nhật bài viết.")
    });
  }

  toggleLike(post: PostModel) {
    if (!this.currentUserId) return;
    
    // Optimistic UI update
    const hasLiked = post.likes?.includes(this.currentUserId);
    if (hasLiked) {
      post.likes = post.likes?.filter(id => id !== this.currentUserId) || [];
    } else {
      if (!post.likes) post.likes = [];
      post.likes.push(this.currentUserId);
    }

    this.socialService.toggleLike(post.id!, this.currentUserId).subscribe({
      next: (res) => {
        post.likes = res.likes; // Sync with server
      },
      error: () => {
        // Revert on error
        this.loadFeed();
      }
    });
  }

  hasLiked(post: PostModel): boolean {
    return post.likes ? post.likes.includes(this.currentUserId) : false;
  }

  toggleComments(post: PostModel) {
    post.showComments = !post.showComments;
    if (post.showComments && !post.comments) {
      this.socialService.getComments(post.id!).subscribe(res => {
        post.comments = res;
      });
    }
  }

  submitComment(post: PostModel) {
    const txt = this.newCommentContent[post.id!]?.trim();
    if (!txt) return;

    if (!this.currentUserId) {
      this.toastr.error("Cần đăng nhập để bình luận.");
      return;
    }

    const comment: CommentModel = {
      postId: post.id!,
      authorId: this.currentUserId,
      authorName: this.currentUserName,
      content: txt
    };

    this.socialService.addComment(post.id!, comment).subscribe({
      next: (res) => {
        if (!post.comments) post.comments = [];
        post.comments.push(res);
        this.newCommentContent[post.id!] = '';
      },
      error: () => this.toastr.error("Không thể thêm bình luận!")
    });
  }
}
